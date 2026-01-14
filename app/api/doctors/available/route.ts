import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer les médecins disponibles pour une date et heure donnée
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
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');
    const durationParam = searchParams.get('duration');

    if (!dateParam || !timeParam) {
      return NextResponse.json(
        { message: 'Date et heure sont requis' },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(dateParam);
    const appointmentTime = timeParam;
    const duration = durationParam ? parseInt(durationParam) : 30; // Durée par défaut 30 minutes

    // Calculer l'heure de début et de fin du nouveau rendez-vous
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const newStartDateTime = new Date(appointmentDate);
    newStartDateTime.setHours(hours, minutes, 0, 0);
    
    const newEndDateTime = new Date(newStartDateTime);
    newEndDateTime.setMinutes(newEndDateTime.getMinutes() + duration);

    console.log('🔍 Vérification disponibilité:', {
      date: dateParam,
      time: timeParam,
      duration,
      newStart: newStartDateTime.toISOString(),
      newEnd: newEndDateTime.toISOString(),
    });

    // Récupérer tous les médecins
    const allDoctors = await prisma.doctor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialty: true,
        phone: true,
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    // Pour chaque médecin, vérifier s'il a des rendez-vous qui se chevauchent
    const availableDoctors = await Promise.all(
      allDoctors.map(async (doctor) => {
        // Créer une nouvelle date pour chaque médecin pour éviter les mutations
        const dayStart = new Date(appointmentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(appointmentDate);
        dayEnd.setHours(23, 59, 59, 999);

        // Vérifier les rendez-vous existants du médecin pour cette date
        const existingAppointments = await prisma.appointment.findMany({
          where: {
            doctorId: doctor.id,
            date: {
              gte: dayStart,
              lte: dayEnd,
            },
            status: {
              not: 'cancelled',
            },
          },
        });

        // Vérifier s'il y a un chevauchement avec les rendez-vous existants
        const hasConflict = existingAppointments.some((apt) => {
          // Créer la date/heure de début du rendez-vous existant
          const aptDate = new Date(apt.date);
          const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
          aptDate.setHours(aptHours, aptMinutes, 0, 0);
          
          // Calculer l'heure de fin du rendez-vous existant
          const aptEndDateTime = new Date(aptDate);
          aptEndDateTime.setMinutes(aptEndDateTime.getMinutes() + apt.duration);

          // Vérifier le chevauchement : deux rendez-vous se chevauchent si :
          // 1. Le nouveau commence avant la fin de l'existant ET se termine après le début de l'existant
          // 2. Ou l'inverse : l'existant commence avant la fin du nouveau ET se termine après le début du nouveau
          const overlaps = (
            (newStartDateTime < aptEndDateTime && newEndDateTime > aptDate)
          );

          if (overlaps) {
            console.log(`❌ Conflit détecté pour Dr. ${doctor.firstName} ${doctor.lastName}:`, {
              existing: `${apt.time} (${apt.duration}min)`,
              new: `${timeParam} (${duration}min)`,
              existingStart: aptDate.toISOString(),
              existingEnd: aptEndDateTime.toISOString(),
              newStart: newStartDateTime.toISOString(),
              newEnd: newEndDateTime.toISOString(),
            });
          }

          return overlaps;
        });

        return {
          ...doctor,
          available: !hasConflict,
        };
      })
    );

    // Filtrer pour ne retourner que les médecins disponibles
    const onlyAvailable = searchParams.get('onlyAvailable') === 'true';
    const doctors = onlyAvailable
      ? availableDoctors.filter((d) => d.available)
      : availableDoctors;

    return NextResponse.json({
      doctors,
      date: dateParam,
      time: timeParam,
      duration,
    });
  } catch (error) {
    console.error('Error fetching available doctors:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des médecins disponibles' },
      { status: 500 }
    );
  }
}

