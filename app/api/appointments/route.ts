import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, verifyAppointmentModification } from '@/lib/appointmentHelpers';

// GET - Liste tous les rendez-vous (accessible à tous les utilisateurs authentifiés)
export async function GET(request: NextRequest) {
  // Vérifier l'authentification
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const doctorIdParam = searchParams.get('doctorId');
    const patientIdParam = searchParams.get('patientId');

    // Construire les filtres
    const where: any = {};

    if (dateParam) {
      const filterDate = new Date(dateParam);
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (doctorIdParam) {
      where.doctorId = doctorIdParam;
    }

    if (patientIdParam) {
      where.patientId = patientIdParam;
    }

    // Récupérer les rendez-vous depuis la base de données
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            phone: true,
          },
        },
        etage: {
          select: {
            id: true,
            name: true,
            floorNumber: true,
          },
        },
        bloc: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        salle: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau rendez-vous (seulement admin, médecin, réceptionniste)
export async function POST(request: NextRequest) {
  // Vérifier que l'utilisateur peut modifier les rendez-vous
  const user = verifyAppointmentModification(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs, médecins et réceptionnistes peuvent créer des rendez-vous' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { patientId, doctorId, etageId, blocId, salleId, date, time, duration, reason, notes, status } = data;

    console.log('📥 Données reçues pour création rendez-vous:', { patientId, doctorId, etageId, blocId, salleId, date, time, duration });

    // Validation
    if (!patientId || !doctorId || !date || !time) {
      return NextResponse.json(
        { message: 'Patient, médecin, date et heure sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que le patient existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      return NextResponse.json(
        { message: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le médecin existe
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      return NextResponse.json(
        { message: 'Médecin non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier la disponibilité du médecin à cette date/heure
    // Convertir la date en objet Date si c'est une string
    let appointmentDate: Date;
    if (date instanceof Date) {
      appointmentDate = new Date(date);
    } else if (typeof date === 'string') {
      appointmentDate = new Date(date);
    } else {
      return NextResponse.json(
        { message: 'Format de date invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la date est valide
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { message: 'Date invalide' },
        { status: 400 }
      );
    }

    // Extraire les heures et minutes
    if (!time || typeof time !== 'string' || !time.includes(':')) {
      return NextResponse.json(
        { message: 'Format d\'heure invalide (attendu: HH:MM)' },
        { status: 400 }
      );
    }

    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return NextResponse.json(
        { message: 'Heure invalide' },
        { status: 400 }
      );
    }

    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + (duration || 30));

    // Vérifier les rendez-vous existants qui se chevauchent
    const dayStart = new Date(appointmentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          not: 'cancelled',
        },
      },
    });

    // Vérifier s'il y a un chevauchement
    const hasConflict = conflictingAppointments.some((apt) => {
      const aptDate = new Date(apt.date);
      const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
      aptDate.setHours(aptHours, aptMinutes, 0, 0);
      
      const aptEndDateTime = new Date(aptDate);
      aptEndDateTime.setMinutes(aptEndDateTime.getMinutes() + apt.duration);

      // Vérifier le chevauchement
      return (startDateTime < aptEndDateTime && endDateTime > aptDate);
    });

    if (hasConflict) {
      return NextResponse.json(
        { message: 'Le médecin a déjà un rendez-vous à cette date/heure. Veuillez choisir un autre créneau.' },
        { status: 409 }
      );
    }

    // Si l'utilisateur est un réceptionniste, ajouter son ID
    const receptionistId = user.role === 'receptionniste' ? user.userId : null;

    console.log('📝 Création d\'un nouveau rendez-vous:', { patientId, doctorId, date, time });

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        receptionistId: receptionistId || null,
        etageId: etageId && etageId.trim() !== '' ? etageId : null,
        blocId: blocId && blocId.trim() !== '' ? blocId : null,
        salleId: salleId && salleId.trim() !== '' ? salleId : null,
        date: appointmentDate, // Utiliser la date déjà convertie
        time: time || '09:00',
        duration: duration || 30,
        status: status || 'scheduled',
        reason: reason && reason.trim() !== '' ? reason : null,
        notes: notes && notes.trim() !== '' ? notes : null,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            phone: true,
          },
        },
      },
    });

    console.log('✅ Rendez-vous créé avec succès:', appointment.id);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erreur lors de la création du rendez-vous:', error);
    console.error('Détails de l\'erreur:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });

    // Messages d'erreur plus détaillés
    let errorMessage = 'Erreur lors de la création du rendez-vous';
    let statusCode = 500;

    if (error?.code === 'P2002') {
      errorMessage = 'Un rendez-vous avec ces informations existe déjà';
      statusCode = 409;
    } else if (error?.code === 'P2025') {
      errorMessage = 'Données invalides ou manquantes';
      statusCode = 400;
    } else if (error?.message?.includes('table') || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
      errorMessage = 'Erreur de base de données : Les tables n\'existent pas encore. Veuillez exécuter: npx prisma db push';
      statusCode = 500;
    } else if (error?.message) {
      errorMessage = `Erreur : ${error.message}`;
    }

    return NextResponse.json(
      { 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        code: error?.code,
      },
      { status: statusCode }
    );
  }
}


