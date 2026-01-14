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

// GET - Obtenir un infirmier par ID
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
    const nurse = await prisma.nurse.findUnique({
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

    if (!nurse) {
      return NextResponse.json(
        { message: 'Infirmier non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...nurse, role: 'infirmier' as const });
  } catch (error) {
    console.error('Error fetching nurse:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'infirmier' },
      { status: 500 }
    );
  }
}

// PUT - Modifier un infirmier
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
    const { email, firstName, lastName, phone, password } = data;

    // Vérifier que l'infirmier existe
    const existingNurse = await prisma.nurse.findUnique({
      where: { id: params.id },
    });

    if (!existingNurse) {
      return NextResponse.json(
        { message: 'Infirmier non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== existingNurse.email) {
      const [existingAdmin, existingDoctor, existingNurse2, existingReceptionist] = await Promise.all([
        prisma.admin.findUnique({ where: { email } }),
        prisma.doctor.findUnique({ where: { email } }),
        prisma.nurse.findUnique({ where: { email } }),
        prisma.receptionist.findUnique({ where: { email } }),
      ]);
      if (existingAdmin || existingDoctor || existingNurse2 || existingReceptionist) {
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
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Mettre à jour l'infirmier
    const updatedNurse = await prisma.nurse.update({
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

    return NextResponse.json({ ...updatedNurse, role: 'infirmier' as const });
  } catch (error) {
    console.error('Error updating nurse:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de l\'infirmier' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un infirmier
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
    // Vérifier que l'infirmier existe
    const nurse = await prisma.nurse.findUnique({
      where: { id: params.id },
    });

    if (!nurse) {
      return NextResponse.json(
        { message: 'Infirmier non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer l'infirmier
    await prisma.nurse.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Infirmier supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting nurse:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de l\'infirmier' },
      { status: 500 }
    );
  }
}

