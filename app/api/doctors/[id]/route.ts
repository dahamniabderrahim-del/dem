import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Helper pour vérifier l'authentification admin
function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as { userId: string; email: string; role: string };
    
    if (decoded.role !== 'admin') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

// GET - Obtenir un médecin par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 401 }
    );
  }

  try {
    // Récupérer le médecin depuis la table doctors
    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialty: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { message: 'Médecin non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...doctor, role: 'medecin' as const });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du médecin' },
      { status: 500 }
    );
  }
}

// PUT - Modifier un médecin
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const { email, firstName, lastName, phone, specialty, password, notes } = data;

    // Vérifier que le médecin existe dans la table doctors
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: params.id },
    });

    if (!existingDoctor) {
      return NextResponse.json(
        { message: 'Médecin non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== existingDoctor.email) {
      const [existingAdmin, existingDoc, existingNurse, existingReceptionist] = await Promise.all([
        prisma.admin.findUnique({ where: { email } }),
        prisma.doctor.findUnique({ where: { email } }),
        prisma.nurse.findUnique({ where: { email } }),
        prisma.receptionist.findUnique({ where: { email } }),
      ]);
      if (existingAdmin || existingDoc || existingNurse || existingReceptionist) {
        return NextResponse.json(
          { message: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (email) updateData.email = email;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone || null;
    if (specialty !== undefined) updateData.specialty = specialty || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Mettre à jour le médecin dans la table doctors
    const updatedDoctor = await prisma.doctor.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialty: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ...updatedDoctor, role: 'medecin' as const });
  } catch (error) {
    console.error('Error updating doctor:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du médecin' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un médecin
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 401 }
    );
  }

  try {
    // Vérifier que le médecin existe
    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id },
    });

    if (!doctor) {
      return NextResponse.json(
        { message: 'Médecin non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le médecin de la table doctors
    await prisma.doctor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Médecin supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du médecin' },
      { status: 500 }
    );
  }
}

