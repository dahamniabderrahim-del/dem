import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

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

export async function POST(request: NextRequest) {
  // Vérifier que l'utilisateur est un admin
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs peuvent recruter du personnel' },
      { status: 403 }
    );
  }

  try {
    const { email, password, firstName, lastName, role, phone } = await request.json();

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.$transaction(async (tx) => {
      const [admin, doctor, nurse, receptionist] = await Promise.all([
        tx.admin.findUnique({ where: { email } }),
        tx.doctor.findUnique({ where: { email } }),
        tx.nurse.findUnique({ where: { email } }),
        tx.receptionist.findUnique({ where: { email } }),
      ]);
      return admin || doctor || nurse || receptionist;
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur dans la table appropriée
    let user;
    switch (role) {
      case 'admin':
        user = await prisma.admin.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone: phone || null,
          },
        });
        break;
      case 'medecin':
        user = await prisma.doctor.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone: phone || null,
            specialty: null,
          },
        });
        break;
      case 'infirmier':
        user = await prisma.nurse.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone: phone || null,
          },
        });
        break;
      case 'receptionniste':
        user = await prisma.receptionist.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone: phone || null,
          },
        });
        break;
      default:
        return NextResponse.json(
          { message: 'Rôle invalide' },
          { status: 400 }
        );
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role,
      phone: user.phone,
      specialty: 'specialty' in user ? user.specialty : undefined,
    };

    return NextResponse.json({
      user: userResponse,
      token,
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


