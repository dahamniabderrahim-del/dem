import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';
import bcrypt from 'bcryptjs';

// GET - Liste tous les réceptionnistes
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const receptionists = await prisma.receptionist.findMany({
      orderBy: {
        createdAt: 'desc',
      },
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

    // Ajouter le rôle pour chaque réceptionniste
    const receptionistsWithRole = receptionists.map((r) => ({
      ...r,
      role: 'receptionniste' as const,
    }));

    return NextResponse.json(receptionistsWithRole);
  } catch (error: any) {
    console.error('Error fetching receptionists:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération des réceptionnistes' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau réceptionniste (Admin uniquement)
export async function POST(request: NextRequest) {
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

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Email, mot de passe, prénom et nom sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà (chercher dans toutes les tables)
    const [existingAdmin, existingDoctor, existingNurse, existingReceptionist] = await Promise.all([
      prisma.admin.findUnique({ where: { email } }),
      prisma.doctor.findUnique({ where: { email } }),
      prisma.nurse.findUnique({ where: { email } }),
      prisma.receptionist.findUnique({ where: { email } }),
    ]);

    if (existingAdmin || existingDoctor || existingNurse || existingReceptionist) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouveau réceptionniste
    const newReceptionist = await prisma.receptionist.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
      },
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

    console.log('✅ Réceptionniste créé avec succès:', newReceptionist.id);
    return NextResponse.json({ ...newReceptionist, role: 'receptionniste' as const }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating receptionist:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Erreur lors de la création du réceptionniste' },
      { status: 500 }
    );
  }
}












