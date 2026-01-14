import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer une radio par ID
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
    const radio = await prisma.radio.findUnique({
      where: { id: params.id },
    });

    if (!radio) {
      return NextResponse.json(
        { message: 'Radio non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(radio);
  } catch (error: any) {
    console.error('Error fetching radio:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération de la radio' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une radio (admin uniquement)
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

  if (user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, description } = data;

    if (!name) {
      return NextResponse.json(
        { message: 'Le nom de la radio est requis' },
        { status: 400 }
      );
    }

    const radio = await prisma.radio.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(radio);
  } catch (error: any) {
    console.error('Error updating radio:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { message: 'Radio non trouvée' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la mise à jour de la radio' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une radio (admin uniquement)
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

  if (user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 403 }
    );
  }

  try {
    // Vérifier si la radio est utilisée dans des rendez-vous ou dossiers médicaux
    const appointmentRadios = await prisma.appointmentRadio.count({
      where: { radioId: params.id },
    });

    const medicalRecordRadios = await prisma.medicalRecordRadio.count({
      where: { radioId: params.id },
    });

    if (appointmentRadios > 0 || medicalRecordRadios > 0) {
      return NextResponse.json(
        { message: 'Impossible de supprimer cette radio car elle est utilisée dans des rendez-vous ou dossiers médicaux' },
        { status: 400 }
      );
    }

    await prisma.radio.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Radio supprimée avec succès' });
  } catch (error: any) {
    console.error('Error deleting radio:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { message: 'Radio non trouvée' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la suppression de la radio' },
      { status: 500 }
    );
  }
}













