import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer un modèle par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const template = await prisma.consultationTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json(
        { message: 'Modèle non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du modèle' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un modèle (admin et créateur uniquement)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  if (!['admin', 'medecin'].includes(user.role)) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, category, diagnosis, notes, description, isPublic } = data;

    // Vérifier que le modèle existe
    const existingTemplate = await prisma.consultationTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { message: 'Modèle non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier les permissions (admin ou créateur)
    if (user.role !== 'admin' && existingTemplate.createdBy !== user.userId) {
      return NextResponse.json(
        { message: 'Non autorisé - Vous ne pouvez modifier que vos propres modèles' },
        { status: 403 }
      );
    }

    const template = await prisma.consultationTemplate.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(category !== undefined && { category: category || null }),
        ...(diagnosis !== undefined && { diagnosis: diagnosis || null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(description !== undefined && { description: description || null }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du modèle' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un modèle (admin et créateur uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  if (!['admin', 'medecin'].includes(user.role)) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 403 }
    );
  }

  try {
    const existingTemplate = await prisma.consultationTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { message: 'Modèle non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier les permissions (admin ou créateur)
    if (user.role !== 'admin' && existingTemplate.createdBy !== user.userId) {
      return NextResponse.json(
        { message: 'Non autorisé - Vous ne pouvez supprimer que vos propres modèles' },
        { status: 403 }
      );
    }

    await prisma.consultationTemplate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Modèle supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du modèle' },
      { status: 500 }
    );
  }
}













