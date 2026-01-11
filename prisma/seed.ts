import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

// Utiliser l'URL depuis les variables d'environnement ou la valeur par défaut
process.env.DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres.sihqjtkdlmguhsjlqamz:Admingeoserver@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Supprimer les données existantes (optionnel)
  await prisma.examination.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.nurse.deleteMany();
  await prisma.receptionist.deleteMany();
  await prisma.admin.deleteMany();

  // Créer les utilisateurs
  console.log('👤 Création des utilisateurs...');
  
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@clinique.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'Système',
      phone: '+33 1 23 45 67 89',
    },
  });

  const doctor = await prisma.doctor.create({
    data: {
      email: 'medecin@clinique.com',
      password: await bcrypt.hash('medecin123', 10),
      firstName: 'Dr. Jean',
      lastName: 'Dupont',
      phone: '+33 1 23 45 67 90',
      specialty: 'Medecine Generale',
    },
  });

  const receptionist = await prisma.receptionist.create({
    data: {
      email: 'reception@clinique.com',
      password: await bcrypt.hash('reception123', 10),
      firstName: 'Marie',
      lastName: 'Martin',
      phone: '+33 1 23 45 67 91',
    },
  });

  const nurse = await prisma.nurse.create({
    data: {
      email: 'infirmier@clinique.com',
      password: await bcrypt.hash('infirmier123', 10),
      firstName: 'Sophie',
      lastName: 'Laurent',
      phone: '+33 1 23 45 67 92',
    },
  });

  console.log('✅ Utilisateurs créés');

  // Créer les patients
  console.log('🏥 Création des patients...');
  
  const patient1 = await prisma.patient.create({
    data: {
      firstName: 'Pierre',
      lastName: 'Durand',
      dateOfBirth: new Date('1980-05-15'),
      gender: 'M',
      phone: '+33 6 12 34 56 78',
      email: 'pierre.durand@email.com',
      address: '123 Rue de la Santé, 75014 Paris',
      insuranceNumber: '123456789',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      firstName: 'Sophie',
      lastName: 'Bernard',
      dateOfBirth: new Date('1990-08-22'),
      gender: 'F',
      phone: '+33 6 23 45 67 89',
      email: 'sophie.bernard@email.com',
      address: '456 Avenue des Médecins, 69001 Lyon',
      insuranceNumber: '987654321',
    },
  });

  console.log('✅ Patients créés');

  // Créer un rendez-vous
  console.log('📅 Création des rendez-vous...');
  
  await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor.id,
      date: new Date(),
      time: '09:00',
      duration: 30,
      status: 'scheduled',
      reason: 'Consultation générale',
    },
  });

  console.log('✅ Rendez-vous créés');

  // Créer les médicaments
  console.log('💊 Création des médicaments...');
  
  const medicament1 = await prisma.medicament.create({
    data: {
      name: 'Paracétamol',
      category: 'Antalgique',
      description: 'Antalgique et antipyrétique',
      unit: 'mg',
      stock: 500,
      minStock: 100,
      price: 2.50,
      supplier: 'PharmaCorp',
    },
  });

  const medicament2 = await prisma.medicament.create({
    data: {
      name: 'Ibuprofène',
      category: 'Anti-inflammatoire',
      description: 'Anti-inflammatoire non stéroïdien',
      unit: 'mg',
      stock: 300,
      minStock: 50,
      price: 3.20,
      supplier: 'PharmaCorp',
    },
  });

  const medicament3 = await prisma.medicament.create({
    data: {
      name: 'Amoxicilline',
      category: 'Antibiotique',
      description: 'Antibiotique à large spectre',
      unit: 'mg',
      stock: 200,
      minStock: 50,
      price: 5.80,
      supplier: 'MedSupply',
    },
  });

  const medicament4 = await prisma.medicament.create({
    data: {
      name: 'Aspirine',
      category: 'Antalgique',
      description: 'Antalgique et antiagrégant plaquettaire',
      unit: 'mg',
      stock: 400,
      minStock: 100,
      price: 1.90,
      supplier: 'PharmaCorp',
    },
  });

  console.log('✅ Médicaments créés');

  console.log('✨ Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

