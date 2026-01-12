import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

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
    const medicament = await prisma.medicament.findUnique({
      where: { id: params.id },
    });

    if (!medicament) {
      return NextResponse.json(
        { message: 'Médicament non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(medicament);
  } catch (error) {
    console.error('Error fetching medicament:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du médicament' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'medecin')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, category, description, unit, stock, minStock, price, expiryDate, supplier } = data;

    const medicament = await prisma.medicament.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        category: category !== undefined ? category : undefined,
        description: description !== undefined ? description : undefined,
        unit: unit !== undefined ? unit : undefined,
        stock: stock !== undefined ? stock : undefined,
        minStock: minStock !== undefined ? minStock : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        supplier: supplier !== undefined ? supplier : undefined,
      },
    });

    return NextResponse.json(medicament);
  } catch (error) {
    console.error('Error updating medicament:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du médicament' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 403 }
    );
  }

  try {
    await prisma.medicament.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Médicament supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting medicament:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du médicament' },
      { status: 500 }
    );
  }
}













