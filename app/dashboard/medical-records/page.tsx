'use client';

import { useEffect, useState } from 'react';
import { patientService } from '@/services/patientService';
import { medicalHistoryService as medicalHistoryServiceAPI } from '@/services/medicalHistoryService';
import { allergyService } from '@/services/allergyService';
import { medicalHistoryService } from '@/services/medicalHistoryService';
import { familyHistoryService } from '@/services/familyHistoryService';
import { documentService } from '@/services/documentService';
import { Patient, Appointment, ConsultationReport, Allergy, MedicalHistory, FamilyHistory, Document } from '@/types';
import { FileText, Search, Calendar, Stethoscope, Pill, Scan, Scissors, Clock, Filter, Download, User, Phone, Mail, MapPin, TrendingUp, Activity, AlertCircle, ChevronDown, ChevronUp, Eye, Edit, Plus, Upload, X, AlertTriangle, Heart, Users as UsersIcon } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { generateInvoicePDF, generatePrescriptionPDF, generateCertificatePDF, generateBilanPDF, generateLetterPDF } from '@/lib/pdfGenerator';
import { AntecedentsTab, DocumentsTab } from './components';
import { useAuthStore } from '@/store/authStore';

interface MedicalHistoryItem {
  id: string;
  type: 'consultation' | 'prescription' | 'radio' | 'operation';
  date: Date;
  title: string;
  description?: string;
  data: any;
}

export default function MedicalRecordsPage() {
  const user = useAuthStore((state) => state.user);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<MedicalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([]);
  const [familyHistories, setFamilyHistories] = useState<FamilyHistory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showFamilyHistoryModal, setShowFamilyHistoryModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'antecedents' | 'documents'>('history');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchMedicalHistory(selectedPatient.id);
      fetchAntecedents(selectedPatient.id);
      fetchDocuments(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchAntecedents = async (patientId: string) => {
    try {
      const [allergiesData, medicalHistoriesData, familyHistoriesData] = await Promise.all([
        allergyService.getByPatient(patientId),
        medicalHistoryService.getByPatient(patientId),
        familyHistoryService.getByPatient(patientId),
      ]);
      setAllergies(allergiesData);
      setMedicalHistories(medicalHistoriesData);
      setFamilyHistories(familyHistoriesData);
    } catch (error) {
      console.error('Error fetching antecedents:', error);
    }
  };

  const fetchDocuments = async (patientId: string) => {
    try {
      const data = await documentService.getAll({ patientId });
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalHistory = async (patientId: string) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/patients/${patientId}/medical-history`);
      const history = await response.json();
      const items: MedicalHistoryItem[] = [];

      // Ajouter les consultations (appointments avec consultation)
      history.appointments.forEach((appointment: any) => {
        const appointmentDate = new Date(appointment.date);
        
        // Consultation principale
        if (appointment.diagnosis || appointment.consultationNotes || appointment.consultation) {
          items.push({
            id: `consultation-${appointment.id}`,
            type: 'consultation',
            date: appointmentDate,
            title: `Consultation avec Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`,
            description: appointment.diagnosis || appointment.consultationNotes || 'Consultation effectuée',
            data: appointment,
          });
        }

        // Rapports de consultation (consultation JSON)
        if (appointment.consultation) {
          let consultationReports: ConsultationReport[] = [];
          try {
            // Si consultation est une string JSON, la parser
            if (typeof appointment.consultation === 'string') {
              consultationReports = JSON.parse(appointment.consultation);
            } else if (Array.isArray(appointment.consultation)) {
              consultationReports = appointment.consultation;
            }
          } catch (e) {
            console.error('Error parsing consultation JSON:', e);
          }

          consultationReports.forEach((report: ConsultationReport) => {
            items.push({
              id: `report-${appointment.id}-${report.id}`,
              type: 'consultation',
              date: new Date(report.date || appointmentDate),
              title: `Rapport: ${report.title}`,
              description: report.summary || report.notes || report.title,
              data: { appointment, report },
            });
          });
        }

        // Prescriptions du rendez-vous
        if (appointment.prescription) {
          const prescription = appointment.prescription;
          const medicamentsList = prescription.medicaments
            ?.map((pm: any) => `${pm.medicament?.name || 'Médicament'} - ${pm.dosage || ''} ${pm.frequency || ''} pendant ${pm.duration || ''}`)
            .filter(Boolean)
            .join('; ') || 'Aucun médicament';

          items.push({
            id: `prescription-${appointment.id}-${prescription.id}`,
            type: 'prescription',
            date: appointmentDate,
            title: `Prescription du ${formatDate(appointmentDate)}`,
            description: `Médicaments: ${medicamentsList}. ${prescription.instructions || ''}`,
            data: { appointment, prescription },
          });
        }

        // Radios du rendez-vous
        if (appointment.radios && appointment.radios.length > 0) {
          appointment.radios.forEach((appointmentRadio: any) => {
            items.push({
              id: `radio-${appointment.id}-${appointmentRadio.id}`,
              type: 'radio',
              date: appointmentDate,
              title: `Radio: ${appointmentRadio.radio?.name || 'Radio'}`,
              description: appointmentRadio.results || appointmentRadio.notes,
              data: appointmentRadio,
            });
          });
        }

        // Opérations du rendez-vous
        if (appointment.operations && appointment.operations.length > 0) {
          appointment.operations.forEach((appointmentOperation: any) => {
            items.push({
              id: `operation-${appointment.id}-${appointmentOperation.id}`,
              type: 'operation',
              date: new Date(appointmentOperation.date || appointmentDate),
              title: `Opération: ${appointmentOperation.operation?.name || 'Opération'}`,
              description: appointmentOperation.notes,
              data: appointmentOperation,
            });
          });
        }
      });


      // Ajouter les radios du dossier médical
      if (history.medicalRecord?.radios) {
        history.medicalRecord.radios.forEach((medicalRecordRadio: any) => {
          items.push({
            id: `medical-record-radio-${medicalRecordRadio.id}`,
            type: 'radio',
            date: new Date(history.medicalRecord.createdAt),
            title: `Radio: ${medicalRecordRadio.radio?.name || 'Radio'}`,
            description: medicalRecordRadio.results || medicalRecordRadio.notes,
            data: medicalRecordRadio,
          });
        });
      }

      // Ajouter les opérations du dossier médical
      if (history.medicalRecord?.operations) {
        history.medicalRecord.operations.forEach((medicalRecordOperation: any) => {
          items.push({
            id: `medical-record-operation-${medicalRecordOperation.id}`,
            type: 'operation',
            date: new Date(medicalRecordOperation.date || history.medicalRecord.createdAt),
            title: `Opération: ${medicalRecordOperation.operation?.name || 'Opération'}`,
            description: medicalRecordOperation.notes,
            data: medicalRecordOperation,
          });
        });
      }

      // Trier par date (plus récent en premier)
      items.sort((a, b) => b.date.getTime() - a.date.getTime());

      setMedicalHistory(items);
      setFilteredHistory(items);
    } catch (error) {
      console.error('Error fetching medical history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrer l'historique médical
  useEffect(() => {
    let filtered = [...medicalHistory];

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filtre par recherche dans l'historique
    if (historySearchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(historySearchTerm.toLowerCase())
      );
    }

    // Filtre par date
    if (dateFilter.start) {
      const startDate = new Date(dateFilter.start);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => item.date >= startDate);
    }
    if (dateFilter.end) {
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => item.date <= endDate);
    }

    setFilteredHistory(filtered);
  }, [medicalHistory, selectedType, historySearchTerm, dateFilter]);

  // Calculer les statistiques
  const getStatistics = () => {
    const stats = {
      consultations: medicalHistory.filter(item => item.type === 'consultation').length,
      prescriptions: medicalHistory.filter(item => item.type === 'prescription').length,
      radios: medicalHistory.filter(item => item.type === 'radio').length,
      operations: medicalHistory.filter(item => item.type === 'operation').length,
      total: medicalHistory.length,
    };
    return stats;
  };

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const stats = selectedPatient ? getStatistics() : null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return Stethoscope;
      case 'prescription':
        return Pill;
      case 'radio':
        return Scan;
      case 'operation':
        return Scissors;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'prescription':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'radio':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'operation':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consultation';
      case 'prescription':
        return 'Prescription';
      case 'radio':
        return 'Radio';
      case 'operation':
        return 'Opération';
      default:
        return type;
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[#3B9AEE] rounded-lg flex items-center justify-center text-white font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Dossiers medicaux</h1>
          </div>
          <p className="text-sm text-gray-600 text-center">Historique medical complet des patients.</p>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#3B9AEE]">
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-[#F3E8FF] rounded-xl p-4 text-center border-2 border-[#A855F7]">
                <p className="text-gray-600 text-sm font-medium">Consultations</p>
                <p className="text-3xl font-bold text-gray-800">{stats.consultations}</p>
              </div>
              <div className="bg-[#E4FFE9] rounded-xl p-4 text-center border-2 border-[#4ADE80]">
                <p className="text-gray-600 text-sm font-medium">Prescriptions</p>
                <p className="text-3xl font-bold text-gray-800">{stats.prescriptions}</p>
              </div>
              <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#38BDF8]">
                <p className="text-gray-600 text-sm font-medium">Radios</p>
                <p className="text-3xl font-bold text-gray-800">{stats.radios}</p>
              </div>
              <div className="bg-[#FFE4E4] rounded-xl p-4 text-center border-2 border-[#FF6B6B]">
                <p className="text-gray-600 text-sm font-medium">Operations</p>
                <p className="text-3xl font-bold text-gray-800">{stats.operations}</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des patients */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Chargement...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucun patient trouvé</div>
            ) : (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    selectedPatient?.id === patient.id ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                >
                  <p className="font-medium text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Né(e) le {formatDate(patient.dateOfBirth)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Historique médical */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200">
          {selectedPatient ? (
            <div className="p-6">
              {/* En-tête avec informations du patient */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h2>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{selectedPatient.gender} • Né(e) le {formatDate(selectedPatient.dateOfBirth)}</span>
                        <span className="text-gray-400">•</span>
                        <span>Âge: {Math.floor((new Date().getTime() - new Date(selectedPatient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} ans</span>
                      </div>
                      {selectedPatient.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{selectedPatient.phone}</span>
                        </div>
                      )}
                      {selectedPatient.email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{selectedPatient.email}</span>
                        </div>
                      )}
                      {selectedPatient.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedPatient.address}</span>
                        </div>
                      )}
                      {selectedPatient.insuranceNumber && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>N° Assurance: {selectedPatient.insuranceNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Générer un bilan médical
                        const bilan = {
                          type: 'Bilan médical complet',
                          date: new Date(),
                          results: `Consultations: ${stats?.consultations || 0}\nPrescriptions: ${stats?.prescriptions || 0}\nRadios: ${stats?.radios || 0}\nOpérations: ${stats?.operations || 0}`,
                          observations: `Historique médical complet du patient ${selectedPatient.firstName} ${selectedPatient.lastName}`,
                        };
                        const doctor = user?.role === 'medecin' ? user : undefined;
                        generateBilanPDF(bilan, selectedPatient, doctor);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      title="Générer un bilan médical"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Bilan</span>
                    </button>
                    <button
                      onClick={() => {
                        // Générer un certificat médical
                        const certificate = {
                          type: 'Certificat médical',
                          reason: 'Consultation médicale',
                          duration: '',
                          observations: `Le patient ${selectedPatient.firstName} ${selectedPatient.lastName}, né(e) le ${formatDate(selectedPatient.dateOfBirth)}, a été consulté(e) le ${formatDate(new Date())}.`,
                        };
                        const doctor = user?.role === 'medecin' ? user : undefined;
                        generateCertificatePDF(certificate, selectedPatient, doctor);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      title="Générer un certificat médical"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Certificat</span>
                    </button>
                    <button
                      onClick={() => {
                        // Générer un courrier médical
                        const letter = {
                          title: 'COURRIER MÉDICAL',
                          type: 'Lettre de consultation',
                          date: new Date(),
                          recipient: '',
                          subject: `Suivi médical - ${selectedPatient.firstName} ${selectedPatient.lastName}`,
                          body: `Madame, Monsieur,\n\nJ'ai le plaisir de vous adresser le présent courrier concernant le suivi médical de ${selectedPatient.firstName} ${selectedPatient.lastName}, né(e) le ${formatDate(selectedPatient.dateOfBirth)}.\n\nHistorique des consultations :\n- Nombre total de consultations : ${stats?.consultations || 0}\n- Prescriptions : ${stats?.prescriptions || 0}\n- Examens radiologiques : ${stats?.radios || 0}\n- Interventions chirurgicales : ${stats?.operations || 0}\n\nVeuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`,
                          recommendations: 'Suivi régulier recommandé.',
                        };
                        const doctor = user?.role === 'medecin' ? user : undefined;
                        generateLetterPDF(letter, selectedPatient, doctor);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      title="Générer un courrier médical"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Courrier</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exporter</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Consultations</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{stats.consultations}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Pill className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Prescriptions</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{stats.prescriptions}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Scan className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Radios</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{stats.radios}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Scissors className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">Opérations</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900">{stats.operations}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              )}

              {/* Onglets */}
              <div className="mb-6 border-b border-gray-200">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'history'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Historique
                  </button>
                  <button
                    onClick={() => setActiveTab('antecedents')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'antecedents'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Antécédents
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'documents'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Documents
                  </button>
                </div>
              </div>

              {/* Filtres et recherche (uniquement pour historique) */}
              {activeTab === 'history' && (
              <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher dans l'historique..."
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">Tous les types</option>
                      <option value="consultation">Consultations</option>
                      <option value="prescription">Prescriptions</option>
                      <option value="radio">Radios</option>
                      <option value="operation">Opérations</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date de début</label>
                    <input
                      type="date"
                      value={dateFilter.start}
                      onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date de fin</label>
                    <input
                      type="date"
                      value={dateFilter.end}
                      onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  {(dateFilter.start || dateFilter.end) && (
                    <div className="flex items-end">
                      <button
                        onClick={() => setDateFilter({ start: '', end: '' })}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300"
                      >
                        Réinitialiser
                      </button>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Contenu selon l'onglet actif */}
              {activeTab === 'history' && (
                <>
                  {loadingHistory ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="mt-4 text-gray-600">Chargement de l'historique médical...</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>
                    {medicalHistory.length === 0
                      ? "Aucun historique médical disponible"
                      : "Aucun résultat ne correspond à vos filtres"}
                  </p>
                  {(selectedType !== 'all' || historySearchTerm || dateFilter.start || dateFilter.end) && (
                    <button
                      onClick={() => {
                        setSelectedType('all');
                        setHistorySearchTerm('');
                        setDateFilter({ start: '', end: '' });
                      }}
                      className="mt-4 text-sm text-primary-600 hover:text-primary-700"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Historique médical ({filteredHistory.length} élément{filteredHistory.length > 1 ? 's' : ''})
                        {filteredHistory.length !== medicalHistory.length && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            sur {medicalHistory.length} total
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">Trié par date (plus récent en premier)</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    {/* Ligne verticale de la timeline */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    {filteredHistory.map((item, index) => {
                      const Icon = getTypeIcon(item.type);
                      return (
                        <div key={item.id} className="relative pl-12 pb-6">
                          {/* Point de la timeline */}
                          <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 ${getTypeColor(item.type)} flex items-center justify-center`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Carte de l'élément */}
                          <div className={`border rounded-lg p-4 ${getTypeColor(item.type)} hover:shadow-md transition-shadow`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                  <span className="text-xs font-semibold uppercase px-2 py-1 rounded">
                                    {getTypeLabel(item.type)}
                                  </span>
                                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(item.date)}</span>
                                  </div>
                                  {item.data.doctor && (
                                    <>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-600">
                                        Dr. {item.data.doctor.firstName} {item.data.doctor.lastName}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                                    {item.description && !expandedItems.has(item.id) && (
                                      <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => toggleExpand(item.id)}
                                    className="ml-2 p-1 hover:bg-white/50 rounded transition-colors"
                                    title={expandedItems.has(item.id) ? "Réduire" : "Voir plus"}
                                  >
                                    {expandedItems.has(item.id) ? (
                                      <ChevronUp className="w-4 h-4 text-gray-600" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-600" />
                                    )}
                                  </button>
                                </div>
                                {expandedItems.has(item.id) && item.description && (
                                  <p className="text-sm text-gray-700 mt-2">{item.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Détails spécifiques selon le type - Affichage conditionnel */}
                            {expandedItems.has(item.id) && (
                              <div className="mt-3 pt-3 border-t border-gray-300 space-y-3">
                                {item.type === 'consultation' && (
                                  <>
                                    {item.data.diagnosis && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1 flex items-center space-x-1">
                                          <AlertCircle className="w-3 h-3" />
                                          <span>Diagnostic:</span>
                                        </p>
                                        <p className="text-sm text-gray-900 bg-white/50 p-2 rounded">{item.data.diagnosis}</p>
                                      </div>
                                    )}
                                    {item.data.consultationNotes && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1">Notes de consultation:</p>
                                        <p className="text-sm text-gray-900 bg-white/50 p-2 rounded">{item.data.consultationNotes}</p>
                                      </div>
                                    )}
                                    {item.data.report && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1">Rapport détaillé:</p>
                                        <div className="text-sm text-gray-900 bg-white/50 p-2 rounded">
                                          <p className="font-medium">{item.data.report.title}</p>
                                          {item.data.report.description && (
                                            <p className="mt-1">{item.data.report.description}</p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}

                                {item.type === 'prescription' && item.data.prescription && (
                                  <>
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
                                        <Pill className="w-3 h-3" />
                                        <span>Médicaments prescrits:</span>
                                      </p>
                                      <ul className="space-y-2 bg-white/50 p-3 rounded">
                                        {item.data.prescription.medicaments?.length > 0 ? (
                                          item.data.prescription.medicaments.map((pm: any, idx: number) => (
                                            <li key={idx} className="text-sm text-gray-900 flex items-start space-x-2">
                                              <Pill className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                              <div>
                                                <span className="font-medium">{pm.medicament?.name || 'Médicament'}</span>
                                                {(pm.dosage || pm.frequency || pm.duration) && (
                                                  <span className="text-gray-600">
                                                    {' '}- {pm.dosage || ''} {pm.frequency || ''} pendant {pm.duration || ''}
                                                  </span>
                                                )}
                                                {pm.quantity && (
                                                  <span className="text-gray-500 text-xs ml-2">(Quantité: {pm.quantity})</span>
                                                )}
                                              </div>
                                            </li>
                                          ))
                                        ) : (
                                          <li className="text-sm text-gray-500">Aucun médicament</li>
                                        )}
                                      </ul>
                                    </div>
                                    {item.data.prescription.instructions && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1">Instructions spéciales:</p>
                                        <p className="text-sm text-gray-900 bg-white/50 p-2 rounded">{item.data.prescription.instructions}</p>
                                      </div>
                                    )}
                                  </>
                                )}

                                {item.type === 'radio' && (
                                  <>
                                    {item.data.results && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1 flex items-center space-x-1">
                                          <Scan className="w-3 h-3" />
                                          <span>Résultats:</span>
                                        </p>
                                        <p className="text-sm text-gray-900 bg-white/50 p-2 rounded">{item.data.results}</p>
                                      </div>
                                    )}
                                    {item.data.notes && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1">Notes:</p>
                                        <p className="text-sm text-gray-900 bg-white/50 p-2 rounded">{item.data.notes}</p>
                                      </div>
                                    )}
                                    {item.data.radio && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1">Type de radio:</p>
                                        <p className="text-sm text-gray-900 bg-white/50 p-2 rounded">{item.data.radio.name}</p>
                                      </div>
                                    )}
                                  </>
                                )}

                                {item.type === 'operation' && (
                                  <>
                                    {item.data.notes && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1 flex items-center space-x-1">
                                          <Scissors className="w-3 h-3" />
                                          <span>Notes opératoires:</span>
                                        </p>
                                        <p className="text-sm text-gray-900 bg-white/50 p-2 rounded">{item.data.notes}</p>
                                      </div>
                                    )}
                                    {item.data.operation && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1">Type d'opération:</p>
                                        <p className="text-sm text-gray-900 bg-white/50 p-2 rounded">{item.data.operation.name}</p>
                                      </div>
                                    )}
                                    {item.data.date && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1">Date de l'opération:</p>
                                        <p className="text-sm text-gray-900 bg-white/50 p-2 rounded">{formatDate(new Date(item.data.date))}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                  )}
                </>
              )}

              {activeTab === 'antecedents' && (
                <AntecedentsTab
                  patientId={selectedPatient.id}
                  allergies={allergies}
                  medicalHistories={medicalHistories}
                  familyHistories={familyHistories}
                  onRefresh={() => {
                    fetchAntecedents(selectedPatient.id);
                  }}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentsTab
                  patientId={selectedPatient.id}
                  documents={documents}
                  onRefresh={() => {
                    fetchDocuments(selectedPatient.id);
                  }}
                />
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Sélectionnez un patient pour voir son dossier médical complet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  </div>
  );
}

