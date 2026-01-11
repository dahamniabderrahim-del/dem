import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer une opération par ID
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
    const operation = await prisma.operation.findUnique({
      where: { id: params.id },
    });

    if (!operation) {
      return NextResponse.json(
        { message: 'Opération non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(operation);
  } catch (error: any) {
    console.error('Error fetching operation:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération de l\'opération' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une opération (admin uniquement)
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
        { message: 'Le nom de l\'opération est requis' },
        { status: 400 }
      );
    }

    const operation = await prisma.operation.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(operation);
  } catch (error: any) {
    console.error('Error updating operation:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { message: 'Opération non trouvée' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la mise à jour de l\'opération' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une opération (admin uniquement)
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
    // Vérifier si l'opération est utilisée dans des rendez-vous ou dossiers médicaux
    const appointmentOperations = await prisma.appointmentOperation.count({
      where: { operationId: params.id },
    });

    const medicalRecordOperations = await prisma.medicalRecordOperation.count({
      where: { operationId: params.id },
    });

    if (appointmentOperations > 0 || medicalRecordOperations > 0) {
      return NextResponse.json(
        { message: 'Impossible de supprimer cette opération car elle est utilisée dans des rendez-vous ou dossiers médicaux' },
        { status: 400 }
      );
    }

    await prisma.operation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Opération supprimée avec succès' });
  } catch (error: any) {
    console.error('Error deleting operation:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { message: 'Opération non trouvée' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la suppression de l\'opération' },
      { status: 500 }
    );
  }
}












