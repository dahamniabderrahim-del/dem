import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste tous les documents
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const appointmentId = searchParams.get('appointmentId');
    const category = searchParams.get('category');

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (appointmentId) where.appointmentId = appointmentId;
    if (category) where.category = category;

    const documents = await prisma.document.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau document (upload)
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const patientId = formData.get('patientId') as string;
    const appointmentId = formData.get('appointmentId') as string | null;
    const medicalRecordId = formData.get('medicalRecordId') as string | null;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string | null;

    if (!file || !patientId) {
      return NextResponse.json(
        { message: 'Le fichier et le patient sont requis' },
        { status: 400 }
      );
    }

    // Ici, vous devriez uploader le fichier vers un service de stockage (S3, Cloudinary, etc.)
    // Pour l'instant, on simule avec une URL
    const fileUrl = `/uploads/${Date.now()}-${file.name}`;
    const fileSize = file.size;
    const mimeType = file.type;

    const document = await prisma.document.create({
      data: {
        patientId,
        appointmentId: appointmentId || null,
        medicalRecordId: medicalRecordId || null,
        name: file.name,
        type: file.type.split('/')[1] || 'unknown',
        category: category || 'Autre',
        fileUrl,
        fileSize,
        mimeType,
        description: description || null,
        uploadedBy: user.userId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}












