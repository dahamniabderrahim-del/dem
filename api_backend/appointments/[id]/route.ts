import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, verifyAppointmentModification } from '@/lib/appointmentHelpers';

// GET - Obtenir un rendez-vous par ID (accessible à tous les utilisateurs authentifiés)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier l'authentification
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
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
    });

    if (!appointment) {
      return NextResponse.json(
        { message: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du rendez-vous' },
      { status: 500 }
    );
  }
}

// PUT - Modifier un rendez-vous (seulement admin, médecin, réceptionniste)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier que l'utilisateur peut modifier les rendez-vous
  const user = verifyAppointmentModification(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs, médecins et réceptionnistes peuvent modifier des rendez-vous' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { 
      patientId, 
      doctorId, 
      etageId,
      blocId,
      salleId,
      date, 
      time, 
      duration, 
      reason, 
      notes, 
      status,
      diagnosis,
      consultationNotes,
      consultation
    } = data;

    // Vérifier que le rendez-vous existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { message: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le patient si fourni
    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      });
      if (!patient) {
        return NextResponse.json(
          { message: 'Patient non trouvé' },
          { status: 404 }
        );
      }
    }

    // Vérifier le médecin si fourni
    if (doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
      });
      if (!doctor) {
        return NextResponse.json(
          { message: 'Médecin non trouvé' },
          { status: 404 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (patientId) updateData.patientId = patientId;
    if (doctorId) updateData.doctorId = doctorId;
    if (date) updateData.date = new Date(date);
    if (time !== undefined) updateData.time = time;
    if (duration !== undefined) updateData.duration = duration;
    if (status !== undefined) updateData.status = status;
    if (reason !== undefined) updateData.reason = reason || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (etageId !== undefined) updateData.etageId = etageId || null;
    if (blocId !== undefined) updateData.blocId = blocId || null;
    if (salleId !== undefined) updateData.salleId = salleId || null;
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis || null;
    if (consultationNotes !== undefined) updateData.consultationNotes = consultationNotes || null;
    if (consultation !== undefined) updateData.consultation = consultation ? JSON.parse(JSON.stringify(consultation)) : null;

    // Mettre à jour le rendez-vous
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du rendez-vous' },
      { status: 500 }
    );
  }
}

// PATCH - Modifier partiellement un rendez-vous (ex: annuler) (seulement admin, médecin, réceptionniste)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier que l'utilisateur peut modifier les rendez-vous
  const user = verifyAppointmentModification(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs, médecins et réceptionnistes peuvent modifier des rendez-vous' },
      { status: 403 }
    );
  }

  try {
    const url = new URL(request.url);
    const isCancel = url.pathname.includes('cancel');

    // Vérifier que le rendez-vous existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { message: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    // Si c'est une annulation
    if (isCancel) {
      const cancelledAppointment = await prisma.appointment.update({
        where: { id: params.id },
        data: {
          status: 'cancelled',
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

      return NextResponse.json(cancelledAppointment);
    }

    // Sinon, mettre à jour avec les données fournies
    const data = await request.json();
    const updateData: any = {};
    
    if (data.date) updateData.date = new Date(data.date);
    if (data.time !== undefined) updateData.time = data.time;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.reason !== undefined) updateData.reason = data.reason || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.diagnosis !== undefined) updateData.diagnosis = data.diagnosis || null;
    if (data.consultationNotes !== undefined) updateData.consultationNotes = data.consultationNotes || null;
    if (data.consultation !== undefined) updateData.consultation = data.consultation ? JSON.parse(JSON.stringify(data.consultation)) : null;

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du rendez-vous' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un rendez-vous (seulement admin, médecin, réceptionniste)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier que l'utilisateur peut modifier les rendez-vous
  const user = verifyAppointmentModification(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs, médecins et réceptionnistes peuvent supprimer des rendez-vous' },
      { status: 403 }
    );
  }

  try {
    // Vérifier que le rendez-vous existe
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le rendez-vous
    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du rendez-vous' },
      { status: 500 }
    );
  }
}


