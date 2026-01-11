import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste tous les patients (accessible selon les rôles)
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const patients = await prisma.patient.findMany({
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
      include: {
        medicalRecord: true,
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des patients' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau patient
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  // Seuls admin, médecin, réceptionniste et infirmier peuvent créer des patients
  if (!['admin', 'medecin', 'receptionniste', 'infirmier'].includes(user.role)) {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs, médecins, réceptionnistes et infirmiers peuvent créer des patients' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { firstName, lastName, dateOfBirth, gender, phone, email, address, insuranceNumber } = data;

    // Validation
    if (!firstName || !lastName || !dateOfBirth || !gender || !phone) {
      return NextResponse.json(
        { message: 'Prénom, nom, date de naissance, genre et téléphone sont requis' },
        { status: 400 }
      );
    }

    // Créer le patient
    console.log('📝 Création d\'un nouveau patient:', { firstName, lastName, phone });
    
    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender: gender as 'M' | 'F' | 'Autre',
        phone,
        email: email || null,
        address: address || null,
        insuranceNumber: insuranceNumber || null,
      },
    });

    console.log('✅ Patient créé avec succès:', patient.id);

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du patient' },
      { status: 500 }
    );
  }
}
