# 📊 Structure de la Base de Données

## 🗂️ Tables créées

### 1. Table `users` (Tous les utilisateurs)
Cette table contient **TOUS** les utilisateurs du système, y compris les médecins.

**Champs :**
- `id` - UUID (identifiant unique)
- `email` - Email unique
- `password` - Mot de passe hashé
- `first_name` - Prénom
- `last_name` - Nom
- `role` - Enum: `admin`, `medecin`, `receptionniste`, `infirmier`, `patient`
- `phone` - Téléphone (optionnel)
- `specialty` - Spécialité médicale (pour les médecins uniquement)
- `created_at` - Date de création
- `updated_at` - Date de mise à jour

**⚠️ IMPORTANT : Les médecins sont dans cette table avec `role = 'medecin'`**

### 2. Table `patients`
Patients de la clinique

### 3. Table `appointments`
Rendez-vous médicaux

### 4. Table `medical_records`
Dossiers médicaux

### 5. Table `prescriptions`
Prescriptions médicales

### 6. Table `examinations`
Examens médicaux

### 7. Table `invoices`
Factures

## 🔍 Comment récupérer les médecins ?

### Avec Prisma :
```typescript
// Récupérer tous les médecins
const doctors = await prisma.user.findMany({
  where: {
    role: 'medecin'
  }
});

// Récupérer un médecin par ID
const doctor = await prisma.user.findFirst({
  where: {
    id: doctorId,
    role: 'medecin'
  }
});
```

### Avec SQL direct :
```sql
SELECT * FROM users WHERE role = 'medecin';
```

## 💡 Pourquoi pas de table séparée ?

Les médecins sont des utilisateurs du système, donc ils partagent les mêmes champs de base (email, nom, prénom, etc.). La différence est :
- Le **rôle** (`role = 'medecin'`)
- La **spécialité** (champ `specialty` qui n'est utilisé que pour les médecins)

Cela évite la duplication de données et permet une gestion unifiée des utilisateurs.

























