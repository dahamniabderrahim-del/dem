import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';
import bcrypt from 'bcryptjs';

// GET - Récupérer un réceptionniste par ID
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
    const receptionist = await prisma.receptionist.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!receptionist) {
      return NextResponse.json(
        { message: 'Réceptionniste non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...receptionist, role: 'receptionniste' as const });
  } catch (error: any) {
    console.error('Error fetching receptionist:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du réceptionniste' },
      { status: 500 }
    );
  }
}

// PUT - Modifier un réceptionniste (Admin uniquement)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const { email, password, firstName, lastName, phone } = data;

    // Vérifier que le réceptionniste existe
    const existingReceptionist = await prisma.receptionist.findUnique({
      where: { id: params.id },
    });

    if (!existingReceptionist) {
      return NextResponse.json(
        { message: 'Réceptionniste non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'email est modifié et s'il existe déjà
    if (email && email !== existingReceptionist.email) {
      const [existingAdmin, existingDoctor, existingNurse, existingReceptionist2] = await Promise.all([
        prisma.admin.findUnique({ where: { email } }),
        prisma.doctor.findUnique({ where: { email } }),
        prisma.nurse.findUnique({ where: { email } }),
        prisma.receptionist.findUnique({ where: { email } }),
      ]);

      if (existingAdmin || existingDoctor || existingNurse || existingReceptionist2) {
        return NextResponse.json(
          { message: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedReceptionist = await prisma.receptionist.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('✅ Réceptionniste modifié avec succès:', updatedReceptionist.id);
    return NextResponse.json({ ...updatedReceptionist, role: 'receptionniste' as const });
  } catch (error: any) {
    console.error('Error updating receptionist:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Erreur lors de la modification du réceptionniste' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un réceptionniste (Admin uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 401 }
    );
  }

  try {
    // Vérifier que le réceptionniste existe
    const existingReceptionist = await prisma.receptionist.findUnique({
      where: { id: params.id },
    });

    if (!existingReceptionist) {
      return NextResponse.json(
        { message: 'Réceptionniste non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des rendez-vous associés
    const appointmentsCount = await prisma.appointment.count({
      where: { receptionistId: params.id },
    });

    if (appointmentsCount > 0) {
      return NextResponse.json(
        { message: `Impossible de supprimer ce réceptionniste. Il a ${appointmentsCount} rendez-vous associé(s).` },
        { status: 400 }
      );
    }

    await prisma.receptionist.delete({
      where: { id: params.id },
    });

    console.log('✅ Réceptionniste supprimé avec succès:', params.id);
    return NextResponse.json({ message: 'Réceptionniste supprimé avec succès' });
  } catch (error: any) {
    console.error('Error deleting receptionist:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du réceptionniste' },
      { status: 500 }
    );
  }
}












