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

// GET - Liste tous les médecins
export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 401 }
    );
  }

  try {
    // Récupérer tous les médecins depuis la table doctors
    const doctors = await prisma.doctor.findMany({
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

    // Ajouter le rôle pour la compatibilité avec le frontend
    const doctorsWithRole = doctors.map(doctor => ({
      ...doctor,
      role: 'medecin' as const,
    }));

    return NextResponse.json(doctorsWithRole);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des médecins' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau médecin
export async function POST(request: NextRequest) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const { email, password, firstName, lastName, phone, specialty, notes } = data;

    // Validation
    if (!email || !password || !firstName || !lastName || !specialty) {
      return NextResponse.json(
        { message: 'Email, mot de passe, prénom, nom et spécialité sont requis' },
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

    // Créer le nouveau médecin dans la table doctors
    console.log('📝 Création d\'un nouveau médecin:', { email, firstName, lastName, specialty });
    
    const newDoctor = await prisma.doctor.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        specialty: specialty,
        notes: notes || null,
      },
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

    console.log('✅ Médecin créé avec succès:', newDoctor.id);

    // Ajouter le rôle pour la compatibilité avec le frontend
    return NextResponse.json({ ...newDoctor, role: 'medecin' as const }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erreur lors de la création du médecin:', error);
    console.error('Code d\'erreur Prisma:', error.code);
    console.error('Message d\'erreur:', error.message);
    
    // Messages d'erreur plus détaillés
    let errorMessage = 'Erreur lors de la création du médecin';
    let statusCode = 500;
    
    if (error.code === 'P2002') {
      errorMessage = 'Cet email est déjà utilisé par un autre utilisateur';
      statusCode = 409;
    } else if (error.code === 'P2025') {
      errorMessage = 'Données invalides ou manquantes';
      statusCode = 400;
    } else if (error.message?.includes('table') || error.message?.includes('relation') || error.message?.includes('does not exist')) {
      errorMessage = 'Erreur de base de données : Les tables n\'existent pas encore. Veuillez exécuter: npx prisma db push';
      statusCode = 500;
    } else if (error.message) {
      errorMessage = `Erreur : ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        message: errorMessage, 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code,
      },
      { status: statusCode }
    );
  }
}

