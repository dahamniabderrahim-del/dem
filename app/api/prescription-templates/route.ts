import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste tous les templates de prescriptions
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const templates = await prisma.prescriptionTemplate.findMany({
      where: {
        OR: [
          { isPublic: true },
          { createdBy: user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau template
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'medecin')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, description, content, design, isPublic } = data;

    if (!name || !content) {
      return NextResponse.json(
        { message: 'Le nom et le contenu sont requis' },
        { status: 400 }
      );
    }

    const template = await prisma.prescriptionTemplate.create({
      data: {
        name,
        description: description || null,
        content,
        design: design || null,
        isPublic: isPublic || false,
        createdBy: user.id,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}












