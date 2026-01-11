import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding consultation templates...');

  const templates = [
    {
      name: 'Consultation générale',
      category: 'Générale',
      diagnosis: 'Examen général : État général satisfaisant. Pas de signes d\'alerte. Tension artérielle normale. Pouls régulier.',
      notes: 'Patient en bonne santé générale. Recommandations d\'hygiène de vie. Contrôle dans 6 mois.',
      description: 'Modèle standard pour une consultation générale de routine',
      isPublic: true,
    },
    {
      name: 'Consultation de suivi',
      category: 'Suivi',
      diagnosis: 'Suivi médical : Évolution favorable. Patient suit correctement le traitement prescrit.',
      notes: 'Continuer le traitement actuel. Surveiller les symptômes. Rendez-vous de contrôle dans 1 mois.',
      description: 'Modèle pour les consultations de suivi médical',
      isPublic: true,
    },
    {
      name: 'Consultation urgente',
      category: 'Urgence',
      diagnosis: 'Consultation urgente : Évaluation rapide de l\'état du patient. Signes vitaux stables.',
      notes: 'Traitement immédiat administré. Surveillance nécessaire. Suivi dans 24-48h.',
      description: 'Modèle pour les consultations en urgence',
      isPublic: true,
    },
    {
      name: 'Consultation post-opératoire',
      category: 'Chirurgie',
      diagnosis: 'Suivi post-opératoire : Cicatrisation normale. Pas de signes d\'infection. Évolution favorable.',
      notes: 'Continuer les soins locaux. Respecter les consignes post-opératoires. Contrôle dans 1 semaine.',
      description: 'Modèle pour le suivi post-opératoire',
      isPublic: true,
    },
    {
      name: 'Consultation pédiatrique',
      category: 'Pédiatrie',
      diagnosis: 'Examen pédiatrique : Croissance et développement normaux. Pas de pathologie détectée.',
      notes: 'Vaccination à jour. Alimentation équilibrée. Contrôle dans 3 mois.',
      description: 'Modèle pour les consultations pédiatriques',
      isPublic: true,
    },
    {
      name: 'Consultation gynécologique',
      category: 'Gynécologie',
      diagnosis: 'Examen gynécologique : Examen clinique normal. Pas d\'anomalie détectée.',
      notes: 'Frottis de dépistage effectué. Résultats dans 15 jours. Contrôle annuel recommandé.',
      description: 'Modèle pour les consultations gynécologiques',
      isPublic: true,
    },
    {
      name: 'Consultation cardiologique',
      category: 'Cardiologie',
      diagnosis: 'Examen cardiologique : Rythme cardiaque régulier. Pas de souffle. Tension artérielle normale.',
      notes: 'Électrocardiogramme effectué. Résultats normaux. Contrôle dans 6 mois.',
      description: 'Modèle pour les consultations cardiologiques',
      isPublic: true,
    },
    {
      name: 'Consultation dermatologique',
      category: 'Dermatologie',
      diagnosis: 'Examen dermatologique : Lésions cutanées observées. Diagnostic clinique établi.',
      notes: 'Traitement topique prescrit. Éviter l\'exposition au soleil. Contrôle dans 2 semaines.',
      description: 'Modèle pour les consultations dermatologiques',
      isPublic: true,
    },
  ];

  for (const template of templates) {
    // Vérifier si le modèle existe déjà
    const existing = await prisma.consultationTemplate.findFirst({
      where: { name: template.name },
    });

    if (!existing) {
      await prisma.consultationTemplate.create({
        data: template,
      });
      console.log(`✅ Created template: ${template.name}`);
    } else {
      console.log(`⏭️  Template already exists: ${template.name}`);
    }
  }

  console.log('✅ Consultation templates seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

