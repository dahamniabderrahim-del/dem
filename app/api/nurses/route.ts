import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Helper pour vérifier l'authentification
function verifyAuth(request: NextRequest) {
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
    return decoded;
  } catch {
    return null;
  }
}

// GET - Liste tous les infirmiers (accessible à tous les utilisateurs authentifiés)
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const nurses = await prisma.nurse.findMany({
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

    // Ajouter le rôle pour la compatibilité avec le frontend
    const nursesWithRole = nurses.map(nurse => ({
      ...nurse,
      role: 'infirmier' as const,
    }));

    return NextResponse.json(nursesWithRole);
  } catch (error) {
    console.error('Error fetching nurses:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des infirmiers' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau infirmier (Admin uniquement)
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

    // Créer le nouveau infirmier dans la table nurses
    const newNurse = await prisma.nurse.create({
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

    return NextResponse.json({ ...newNurse, role: 'infirmier' as const }, { status: 201 });
  } catch (error) {
    console.error('Error creating nurse:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'infirmier' },
      { status: 500 }
    );
  }
}

