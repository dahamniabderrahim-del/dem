# Configuration de la base de données Supabase

Ce guide vous explique comment connecter votre application à Supabase PostgreSQL.

## 📋 Prérequis

1. Un compte Supabase : https://supabase.com
2. Un projet Supabase créé
3. Les credentials de connexion

## 🔧 Configuration

### Option 1 : Utiliser la chaîne de connexion PostgreSQL (Recommandé pour votre cas)

Vous avez fourni cette chaîne de connexion :
```
postgresql://postgres.sihqjtkdlmguhsjlqamz:[VOTRE-MOT-DE-PASSE]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

**Étapes :**

1. Créez un fichier `.env.local` à la racine du projet (s'il n'existe pas)

2. Ajoutez la variable d'environnement avec votre mot de passe réel :
```env
DATABASE_URL=postgresql://postgres.sihqjtkdlmguhsjlqamz:VOTRE-MOT-DE-PASSE-ICI@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

JWT_SECRET=votre-secret-jwt-tres-securise
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. **⚠️ IMPORTANT :** Remplacez `VOTRE-MOT-DE-PASSE-ICI` par votre vrai mot de passe Supabase

### Option 2 : Utiliser @supabase/supabase-js

Si vous préférez utiliser l'API Supabase :

1. Allez sur votre dashboard Supabase : https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans Settings > API
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

5. Ajoutez dans `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

## 🗄️ Structure de la base de données

Vous devrez créer les tables suivantes dans Supabase. Voici un script SQL de base :

```sql
-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'medecin', 'receptionniste', 'infirmier', 'patient')),
  phone VARCHAR(20),
  specialty VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender CHAR(1) CHECK (gender IN ('M', 'F', 'Autre')),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  insurance_number VARCHAR(50),
  doctor_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  duration INTEGER DEFAULT 30,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(date);
```

## 📝 Migration des données

Pour migrer vos données mockées vers Supabase, vous pouvez utiliser le fichier `lib/database.ts` qui contient des fonctions helper.

## 🔍 Test de connexion

Pour tester la connexion, vous pouvez créer une route de test :

```typescript
// app/api/test-db/route.ts
import { db, query } from '@/lib/db-pg';

export async function GET() {
  try {
    const result = await query('SELECT NOW() as current_time');
    return Response.json({ 
      success: true, 
      message: 'Connexion réussie!', 
      time: result.rows[0].current_time 
    });
  } catch (error: any) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

Puis visitez : `http://localhost:3000/api/test-db`

## ⚠️ Sécurité

- **Ne jamais** commiter le fichier `.env.local` dans Git
- Utilisez des variables d'environnement pour tous les secrets
- Le fichier `.env.local` est déjà dans `.gitignore`

## 📚 Ressources

- Documentation Supabase : https://supabase.com/docs
- Documentation PostgreSQL : https://www.postgresql.org/docs/
- Documentation node-postgres : https://node-postgres.com/

























