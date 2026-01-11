import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste tous les modèles de consultation (accessibles selon les permissions)
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');
    const onlyPublic = searchParams.get('onlyPublic') !== 'false';

    const where: any = {};
    
    // Si seulement les modèles publics sont demandés
    if (onlyPublic) {
      where.isPublic = true;
    }

    // Filtrer par catégorie si fourni
    if (categoryParam) {
      where.category = categoryParam;
    }

    const templates = await prisma.consultationTemplate.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching consultation templates:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des modèles de consultation' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau modèle de consultation (admin et médecin uniquement)
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  // Seuls admin et médecin peuvent créer des modèles
  if (!['admin', 'medecin'].includes(user.role)) {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs et médecins peuvent créer des modèles' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, category, diagnosis, notes, description, isPublic } = data;

    if (!name) {
      return NextResponse.json(
        { message: 'Le nom du modèle est requis' },
        { status: 400 }
      );
    }

    const template = await prisma.consultationTemplate.create({
      data: {
        name,
        category: category || null,
        diagnosis: diagnosis || null,
        notes: notes || null,
        description: description || null,
        createdBy: user.userId,
        isPublic: isPublic !== undefined ? isPublic : true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating consultation template:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du modèle' },
      { status: 500 }
    );
  }
}












