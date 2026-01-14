import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer les infirmières assignées à un patient
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

  // Seuls admin et médecin peuvent voir les affectations
  if (!['admin', 'medecin'].includes(user.role)) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 403 }
    );
  }

  try {
    const patientNurses = await prisma.patientNurse.findMany({
      where: { patientId: params.id },
      include: {
        nurse: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(patientNurses);
  } catch (error) {
    console.error('Error fetching patient nurses:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des infirmières' },
      { status: 500 }
    );
  }
}

// POST - Assigner une infirmière à un patient
export async function POST(
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

  // Seuls admin et médecin peuvent assigner des infirmières
  if (!['admin', 'medecin'].includes(user.role)) {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs et médecins peuvent assigner des infirmières' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { nurseId } = data;

    if (!nurseId) {
      return NextResponse.json(
        { message: 'L\'ID de l\'infirmière est requis' },
        { status: 400 }
      );
    }

    // Vérifier que le patient existe
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
    });
    if (!patient) {
      return NextResponse.json(
        { message: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'infirmière existe
    const nurse = await prisma.nurse.findUnique({
      where: { id: nurseId },
    });
    if (!nurse) {
      return NextResponse.json(
        { message: 'Infirmière non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si l'affectation existe déjà
    const existing = await prisma.patientNurse.findUnique({
      where: {
        patientId_nurseId: {
          patientId: params.id,
          nurseId: nurseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Cette infirmière est déjà assignée à ce patient' },
        { status: 409 }
      );
    }

    // Créer l'affectation
    const patientNurse = await prisma.patientNurse.create({
      data: {
        patientId: params.id,
        nurseId: nurseId,
      },
      include: {
        nurse: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    console.log('✅ Infirmière assignée au patient avec succès:', patientNurse.id);

    return NextResponse.json(patientNurse, { status: 201 });
  } catch (error: any) {
    console.error('Error assigning nurse to patient:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Cette infirmière est déjà assignée à ce patient' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Erreur lors de l\'assignation de l\'infirmière' },
      { status: 500 }
    );
  }
}

// DELETE - Retirer une infirmière d'un patient
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

  // Seuls admin et médecin peuvent retirer des affectations
  if (!['admin', 'medecin'].includes(user.role)) {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs et médecins peuvent retirer des affectations' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const nurseId = searchParams.get('nurseId');

    if (!nurseId) {
      return NextResponse.json(
        { message: 'L\'ID de l\'infirmière est requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'affectation existe
    const patientNurse = await prisma.patientNurse.findUnique({
      where: {
        patientId_nurseId: {
          patientId: params.id,
          nurseId: nurseId,
        },
      },
    });

    if (!patientNurse) {
      return NextResponse.json(
        { message: 'Affectation non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer l'affectation
    await prisma.patientNurse.delete({
      where: {
        patientId_nurseId: {
          patientId: params.id,
          nurseId: nurseId,
        },
      },
    });

    console.log('✅ Affectation infirmière-patient supprimée avec succès');

    return NextResponse.json({ message: 'Affectation retirée avec succès' });
  } catch (error) {
    console.error('Error removing nurse assignment:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de l\'affectation' },
      { status: 500 }
    );
  }
}













