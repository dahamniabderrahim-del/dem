// Données de démonstration - À remplacer par une vraie base de données en production

import { User, Patient, Appointment } from '@/types';

export const mockUsers: Omit<User, 'password'>[] = [
  {
    id: '1',
    email: 'admin@clinique.com',
    firstName: 'Admin',
    lastName: 'Système',
    role: 'admin',
    phone: '+33 1 23 45 67 89',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'medecin@clinique.com',
    firstName: 'Dr. Jean',
    lastName: 'Dupont',
    role: 'medecin',
    phone: '+33 1 23 45 67 90',
    specialty: 'Medecine Generale',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    email: 'reception@clinique.com',
    firstName: 'Marie',
    lastName: 'Martin',
    role: 'receptionniste',
    phone: '+33 1 23 45 67 91',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    email: 'infirmier@clinique.com',
    firstName: 'Sophie',
    lastName: 'Laurent',
    role: 'infirmier',
    phone: '+33 1 23 45 67 92',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockUsersWithPassword: User[] = [
  {
    ...mockUsers[0],
    password: 'admin123', // En production, utiliser bcrypt hash
  },
  {
    ...mockUsers[1],
    password: 'medecin123',
  },
  {
    ...mockUsers[2],
    password: 'reception123',
  },
  {
    ...mockUsers[3],
    password: 'infirmier123',
  },
];

export let mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Pierre',
    lastName: 'Durand',
    dateOfBirth: new Date('1980-05-15'),
    gender: 'M',
    phone: '+33 6 12 34 56 78',
    email: 'pierre.durand@email.com',
    address: '123 Rue de la Santé, 75014 Paris',
    insuranceNumber: '123456789',
    doctorId: '2', // Assigné au Dr. Jean Dupont
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    firstName: 'Sophie',
    lastName: 'Bernard',
    dateOfBirth: new Date('1990-08-22'),
    gender: 'F',
    phone: '+33 6 23 45 67 89',
    email: 'sophie.bernard@email.com',
    address: '456 Avenue des Médecins, 69001 Lyon',
    insuranceNumber: '987654321',
    doctorId: '2', // Assigné au Dr. Jean Dupont
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export let mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '2',
    date: new Date(),
    time: '09:00',
    duration: 30,
    status: 'scheduled',
    reason: 'Consultation générale',
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];


