export type UserRole = 'admin' | 'medecin' | 'receptionniste' | 'infirmier' | 'patient';

export type MedicalSpecialty = 
  | 'Medecine Generale'
  | 'Cardiologie'
  | 'Dermatologie'
  | 'Gynecologie'
  | 'Pediatrie'
  | 'Orthopedie'
  | 'Neurologie'
  | 'Ophtalmologie'
  | 'ORL'
  | 'Urologie'
  | 'Psychiatrie'
  | 'Endocrinologie'
  | 'Radiologie'
  | 'Anesthesie'
  | 'Chirurgie Generale'
  | string; // Permet les spécialités personnalisées

export interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  specialty?: MedicalSpecialty; // Spécialité médicale (pour les médecins) - peut être prédéfinie ou personnalisée
  notes?: string; // Notes sur le médecin (pour les médecins)
  isActive?: boolean; // Si l'utilisateur est actif
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'M' | 'F' | 'Autre';
  phone: string;
  email?: string;
  address?: string;
  insuranceNumber?: string;
  doctorId?: string; // ID du médecin assigné
  createdAt: Date;
  updatedAt: Date;
  nurses?: PatientNurse[]; // Many-to-Many avec Nurse
  medicalRecord?: MedicalRecord; // Relation One-to-One : un patient a un seul dossier médical
  allergies?: Allergy[];
  medicalHistories?: MedicalHistory[];
  familyHistories?: FamilyHistory[];
  documents?: Document[];
}

// Appointment = Rendez-vous (géré par le réceptionniste)
// Contient aussi les attributs de consultation (One-to-One)
export interface Appointment {
  id: string;
  patientId: string;
  receptionistId: string; // Réceptionniste qui gère le rendez-vous
  doctorId: string; // Médecin assigné au rendez-vous (Many-to-One)
  etageId?: string; // Étage assigné au rendez-vous (Many-to-One)
  blocId?: string; // Bloc assigné au rendez-vous (Many-to-One)
  salleId?: string; // Salle assignée au rendez-vous (Many-to-One)
  prescriptionId?: string; // Prescription liée au rendez-vous/consultation (Many-to-One)
  date: Date;
  time: string;
  duration: number; // en minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'no-show';
  reason?: string;
  notes?: string;
  // Attributs de consultation (One-to-One avec rendez-vous)
  diagnosis?: string; // Diagnostic du médecin
  consultationNotes?: string; // Notes de consultation
  consultation?: ConsultationReport[]; // Rapports de consultation (JSON)
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
  receptionist?: User;
  doctor?: User;
  etage?: Etage; // Relation Many-to-One avec Etage
  bloc?: Bloc; // Relation Many-to-One avec Bloc
  salle?: Salle; // Relation Many-to-One avec Salle
  prescription?: Prescription;
  radios?: AppointmentRadio[]; // Many-to-Many avec Radio
  operations?: AppointmentOperation[]; // Many-to-Many avec Operation
}

// Rapport de consultation stocké dans Appointment.consultation (JSON)
export interface ConsultationReport {
  id: string; // Identifiant du rapport
  date: Date; // Date du rapport
  doctorId?: string; // Médecin ayant rédigé le rapport
  title?: string; // Titre court du rapport
  diagnosis?: string; // Diagnostic posé
  summary?: string; // Résumé/compte rendu
  notes?: string; // Notes additionnelles
  vitals?: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    bloodPressure?: string; // ex: "120/80"
    spo2?: number;
    weightKg?: number;
  };
  prescriptions?: Array<{
    medicamentId: string;
    name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    quantity?: number;
    instructions?: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url?: string;
    contentType?: string;
  }>;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  diagnosis?: string;
  symptoms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medicament {
  id: string;
  name: string;
  category?: string;
  description?: string;
  unit?: string;
  stock: number;
  minStock: number;
  price?: number;
  expiryDate?: Date;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Prescription = Ordonnance médicale
// Une prescription est une ordonnance donnée par un médecin à un patient
// Elle peut contenir plusieurs médicaments
export interface Prescription {
  id: string;
  medicalRecordId?: string;
  prescribedBy?: string; // ID du médecin qui prescrit
  notes?: string; // Notes générales sur l'ordonnance
  instructions?: string; // Instructions générales pour le patient
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
  medicaments?: PrescriptionMedicament[]; // Liste des médicaments dans cette ordonnance
}

// Détails d'un médicament dans une prescription
// Chaque médicament dans une ordonnance a son propre dosage, fréquence et durée
export interface PrescriptionMedicament {
  id: string;
  prescriptionId: string;
  medicamentId: string;
  quantity: number; // Quantité prescrite (ex: 2 boîtes)
  dosage: string; // Dosage (ex: 500mg, 1 comprimé)
  frequency: string; // Fréquence (ex: 3 fois par jour, matin et soir)
  duration: string; // Durée du traitement (ex: 7 jours, 1 mois)
  instructions?: string; // Instructions spécifiques pour ce médicament
  createdAt: Date;
  medicament?: Medicament;
  prescription?: Prescription;
}

export interface Examination {
  id: string;
  patientId: string;
  appointmentId?: string;
  type: string;
  description?: string;
  results?: string;
  requestedDate: Date;
  completedDate?: Date;
  status: 'requested' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  patient?: Patient;
  appointment?: Appointment;
}

// Consultation = Visite médicale
export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
  doctor?: User;
}

export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string; // Liée à un rendez-vous/consultation
  invoiceNumber?: string;
  amount: number | string; // Peut être Decimal de Prisma
  totalAmount?: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: string;
  insuranceCoverage?: number | string; // Peut être Decimal de Prisma
  notes?: string;
  items?: Array<{ description: string; quantity: number; unitPrice: number }>;
  createdAt: Date;
  updatedAt?: Date;
  paidAt?: Date;
  patient?: Patient;
  appointment?: Appointment;
}

export interface Radio {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Operation {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Allergy {
  id: string;
  patientId: string;
  name: string;
  type?: string;
  severity?: string;
  reaction?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  category: string;
  condition: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyHistory {
  id: string;
  patientId: string;
  relation: string;
  condition: string;
  description?: string;
  ageAtOnset?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  patientId?: string;
  appointmentId?: string;
  medicalRecordId?: string;
  name: string;
  type: string;
  category?: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
  appointment?: Appointment;
}

export interface PrescriptionTemplate {
  id: string;
  name: string;
  description?: string;
  content: any; // JSON structure
  design?: any; // JSON design
  isPublic: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  medicamentId: string;
  type: 'entree' | 'sortie' | 'ajustement' | 'perte';
  quantity: number;
  reason?: string;
  referenceId?: string;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  medicament?: Medicament;
}

export interface Reimbursement {
  id: string;
  invoiceId: string;
  amount: number | string;
  insuranceAmount?: number | string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestDate: Date;
  approvalDate?: Date;
  paymentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  invoice?: Invoice;
}

export interface Etage {
  id: string;
  name: string;
  description?: string;
  floorNumber?: number;
  createdAt: Date;
  updatedAt: Date;
  blocs?: Bloc[];
  appointments?: Appointment[];
}

export interface Bloc {
  id: string;
  name: string;
  description?: string;
  location?: string;
  etageId: string;
  createdAt: Date;
  updatedAt: Date;
  etage?: Etage;
  salles?: Salle[];
}

export interface Salle {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  equipment?: string;
  blocId: string;
  createdAt: Date;
  updatedAt: Date;
  bloc?: Bloc;
}

export interface ConsultationTemplate {
  id: string;
  name: string;
  category?: string;
  diagnosis?: string;
  notes?: string;
  description?: string;
  createdBy?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentRadio {
  id: string;
  appointmentId: string;
  radioId: string;
  results?: string;
  notes?: string;
  createdAt: Date;
  appointment?: Appointment;
  radio?: Radio;
}

export interface AppointmentOperation {
  id: string;
  appointmentId: string;
  operationId: string;
  date?: Date;
  notes?: string;
  createdAt: Date;
  appointment?: Appointment;
  operation?: Operation;
}

export interface Nurse {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  doctors?: DoctorNurse[]; // Many-to-Many avec Doctor
  patients?: PatientNurse[]; // Many-to-Many avec Patient
}

export interface DoctorNurse {
  id: string;
  doctorId: string;
  nurseId: string;
  createdAt: Date;
  doctor?: User; // Utilise User pour représenter Doctor
  nurse?: Nurse;
}

export interface PatientNurse {
  id: string;
  patientId: string;
  nurseId: string;
  createdAt: Date;
  patient?: Patient;
  nurse?: Nurse;
}

export interface MedicalRecordRadio {
  id: string;
  medicalRecordId: string;
  radioId: string;
  results?: string; // Résultats de la radio
  notes?: string; // Notes supplémentaires
  createdAt: Date;
  medicalRecord?: MedicalRecord;
  radio?: Radio;
}

export interface MedicalRecordOperation {
  id: string;
  medicalRecordId: string;
  operationId: string;
  date?: Date; // Date de l'opération
  notes?: string; // Notes sur l'opération
  createdAt: Date;
  medicalRecord?: MedicalRecord;
  operation?: Operation;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface DoctorNotification {
  id: string;
  appointmentId: string;
  doctorId: string;
  receptionistId: string;
  type: string; // "patient_ready", "consultation_complete", etc.
  message?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  appointment?: Appointment;
  doctor?: User;
  receptionist?: User;
}

