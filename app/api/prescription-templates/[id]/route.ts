import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer un template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const template = await prisma.prescriptionTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json({ message: 'Template non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions
    if (!template.isPublic && template.createdBy !== user.userId) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 });
    }

    return NextResponse.json(template);
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'medecin')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    const template = await prisma.prescriptionTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json({ message: 'Template non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (template.createdBy !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 });
    }

    const data = await request.json();
    const updated = await prisma.prescriptionTemplate.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating template:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ message: 'Template non trouvé' }, { status: 404 });
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'medecin')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    const template = await prisma.prescriptionTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json({ message: 'Template non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (template.createdBy !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 });
    }

    await prisma.prescriptionTemplate.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Template supprimé avec succès' });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ message: 'Template non trouvé' }, { status: 404 });
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}













