'use client';

import { useEffect, useState } from 'react';
import { appointmentService } from '@/services/appointmentService';
import { patientService } from '@/services/patientService';
import { doctorService, AvailableDoctor } from '@/services/doctorService';
import { etageService } from '@/services/etageService';
import { blocService } from '@/services/blocService';
import { salleService } from '@/services/salleService';
import { Appointment, Patient, User, Etage, Bloc, Salle } from '@/types';
import { Plus, Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Building2, Layers, DoorOpen, Search, Download, Trash2, LayoutGrid, History } from 'lucide-react';
import { formatDate, formatDateTime, formatDuration } from '@/lib/utils';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<'interface' | 'historique'>('interface');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAppointments();
    fetchAllAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      const date = new Date(selectedDate);
      const data = await appointmentService.getByDate(date);
      setAppointments(data.sort((a, b) => a.time.localeCompare(b.time)));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAppointments = async () => {
    try {
      const data = await appointmentService.getAll();
      setAllAppointments(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error fetching all appointments:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-[#3B9AEE] text-white';
      case 'completed':
        return 'bg-[#4ADE80] text-white';
      case 'cancelled':
        return 'bg-[#FBBF24] text-gray-800';
      case 'no-show':
        return 'bg-[#67E8F9] text-gray-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programmé';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      case 'no-show':
        return 'Patient en attente';
      default:
        return status;
    }
  };

  const getResultColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-[#67E8F9] text-gray-800';
      case 'completed':
        return 'bg-[#4ADE80] text-white';
      case 'cancelled':
        return 'bg-[#FBBF24] text-gray-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getResultLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'En attente';
      case 'completed':
        return 'prête';
      case 'cancelled':
        return 'En attente';
      default:
        return 'En attente';
    }
  };

  // Calculer les statistiques
  const totalAppointments = allAppointments.length;
  const scheduledAppointments = allAppointments.filter(a => a.status === 'scheduled').length;
  const completedAppointments = allAppointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = allAppointments.filter(a => a.status === 'cancelled').length;

  // Pagination
  const displayedAppointments = activeTab === 'interface' ? appointments : allAppointments;
  const totalPages = Math.ceil(displayedAppointments.length / itemsPerPage);
  const paginatedAppointments = displayedAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous supprimer ce rendez-vous ?')) {
      try {
        await appointmentService.cancel(id);
        fetchAppointments();
        fetchAllAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Tabs */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => { setActiveTab('interface'); setCurrentPage(1); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'interface'
              ? 'bg-[#3B9AEE] text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Interface</span>
        </button>
        <button
          onClick={() => { setActiveTab('historique'); setCurrentPage(1); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'historique'
              ? 'bg-[#3B9AEE] text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historique</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[#FF6B6B] rounded-lg flex items-center justify-center text-white font-bold">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Réserver un Rendez-vous</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#3B9AEE]">
              <p className="text-gray-600 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-800">{totalAppointments}</p>
            </div>
            <div className="bg-[#F3E8FF] rounded-xl p-4 text-center border-2 border-[#A855F7]">
              <p className="text-gray-600 text-sm font-medium">Programmé</p>
              <p className="text-3xl font-bold text-gray-800">{scheduledAppointments}</p>
            </div>
            <div className="bg-[#E4FFE9] rounded-xl p-4 text-center border-2 border-[#4ADE80]">
              <p className="text-gray-600 text-sm font-medium">Terminé</p>
              <p className="text-3xl font-bold text-gray-800">{completedAppointments}</p>
            </div>
            <div className="bg-[#FFE4E4] rounded-xl p-4 text-center border-2 border-[#FF6B6B]">
              <p className="text-gray-600 text-sm font-medium">Annulés</p>
              <p className="text-3xl font-bold text-gray-800">{cancelledAppointments}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button className="flex items-center space-x-2 bg-[#3B9AEE] text-white px-4 py-2 rounded-lg hover:bg-[#2D8AD8] transition-all">
              <Download className="w-4 h-4" />
              <span>Télécharger PDF</span>
            </button>
            
            <button
              onClick={() => {
                setEditingAppointment(null);
                setShowModal(true);
              }}
              className="flex items-center space-x-2 bg-[#4ADE80] text-white px-4 py-2 rounded-lg hover:bg-[#3ACC70] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#3B9AEE] to-[#60A5FA]">
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">#</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Patient</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Docteur</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Par</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Créé Le</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Pour Le</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Status</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Résultats</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Sup</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    Aucun rendez-vous trouvé
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((appointment, index) => (
                  <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">
                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {appointment.doctor?.firstName?.toLowerCase() || 'admin'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(appointment.createdAt || appointment.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#3B9AEE] font-medium">
                        {new Date(appointment.date).toLocaleDateString('fr-FR')} {appointment.time}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold ${getResultColor(appointment.status)}`}>
                        {getResultLabel(appointment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="p-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, displayedAppointments.length)}-{Math.min(currentPage * itemsPerPage, displayedAppointments.length)} of {displayedAppointments.length} rows
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="px-3 py-1 bg-[#3B9AEE] text-white rounded font-medium">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <AppointmentModal
          appointment={editingAppointment}
          selectedDate={selectedDate}
          onClose={() => {
            setShowModal(false);
            setEditingAppointment(null);
          }}
          onSuccess={() => {
            fetchAppointments();
            fetchAllAppointments();
          }}
        />
      )}
    </div>
  );
}

function AppointmentModal({
  appointment,
  selectedDate,
  onClose,
  onSuccess,
}: {
  appointment: Appointment | null;
  selectedDate: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [etages, setEtages] = useState<Etage[]>([]);
  const [blocs, setBlocs] = useState<Bloc[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<AvailableDoctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<User[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || '',
    doctorId: appointment?.doctorId || '',
    etageId: appointment?.etageId || '',
    blocId: appointment?.blocId || '',
    salleId: appointment?.salleId || '',
    date: appointment?.date ? new Date(appointment.date).toISOString().split('T')[0] : selectedDate,
    time: appointment?.time || '09:00',
    duration: appointment?.duration || 30,
    reason: appointment?.reason || '',
    notes: appointment?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, etagesData] = await Promise.all([
          patientService.getAll(),
          etageService.getAll(),
        ]);
        setPatients(patientsData);
        setEtages(etagesData);
        
        if (appointment?.etageId) {
          try {
            const allBlocs = await blocService.getAll();
            setBlocs(allBlocs.filter(b => b.etageId === appointment.etageId));
          } catch (error) {
            console.error('Error fetching blocs:', error);
          }
        }
        if (appointment?.blocId) {
          try {
            const sallesData = await salleService.getByBloc(appointment.blocId);
            setSalles(sallesData);
          } catch (error) {
            console.error('Error fetching salles:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [appointment]);
  
  useEffect(() => {
    const fetchBlocs = async () => {
      if (formData.etageId) {
        try {
          const allBlocs = await blocService.getAll();
          setBlocs(allBlocs.filter(b => b.etageId === formData.etageId));
        } catch (error) {
          console.error('Error fetching blocs:', error);
        }
      } else {
        setBlocs([]);
        setFormData(prev => ({ ...prev, blocId: '', salleId: '' }));
      }
    };
    fetchBlocs();
  }, [formData.etageId]);
  
  useEffect(() => {
    const fetchSalles = async () => {
      if (formData.blocId) {
        try {
          const sallesData = await salleService.getByBloc(formData.blocId);
          setSalles(sallesData);
        } catch (error) {
          console.error('Error fetching salles:', error);
        }
      } else {
        setSalles([]);
        setFormData(prev => ({ ...prev, salleId: '' }));
      }
    };
    fetchSalles();
  }, [formData.blocId]);

  useEffect(() => {
    const fetchAllDoctors = async () => {
      try {
        const doctors = await doctorService.getAll();
        setAllDoctors(doctors);
        setAvailableDoctors(doctors.map(d => ({ ...d, available: true })));
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setAllDoctors([]);
        setAvailableDoctors([]);
      }
    };
    fetchAllDoctors();
  }, []);

  useEffect(() => {
    const checkDoctorAvailability = async () => {
      if (!formData.doctorId || !formData.date || !formData.time) {
        setAvailabilityWarning(null);
        return;
      }

      try {
        const availableDoctorsData = await doctorService.getAvailable(
          formData.date,
          formData.time,
          formData.duration
        );
        
        const selectedDoctor = availableDoctorsData.find(d => d.id === formData.doctorId);
        
        if (selectedDoctor && !selectedDoctor.available) {
          setAvailabilityWarning(`⚠️ Le médecin sélectionné est occupé à ${formData.time} le ${new Date(formData.date).toLocaleDateString('fr-FR')}. Veuillez choisir une autre heure.`);
        } else {
          setAvailabilityWarning(null);
        }
      } catch (error) {
        console.error('Error checking doctor availability:', error);
        setAvailabilityWarning(null);
      }
    };

    checkDoctorAvailability();
  }, [formData.doctorId, formData.date, formData.time, formData.duration]);

  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      if (!formData.doctorId) {
        setDoctorAppointments([]);
        return;
      }

      setLoadingAppointments(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const startDate = new Date(year, month, 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        const allAppointments = await appointmentService.getAll();
        const filtered = allAppointments.filter(
          apt => {
            if (apt.doctorId !== formData.doctorId || apt.status === 'cancelled') {
              return false;
            }
            
            const aptDate = new Date(apt.date);
            const aptYear = aptDate.getFullYear();
            const aptMonth = aptDate.getMonth();
            const aptDay = aptDate.getDate();
            const aptDateLocal = new Date(aptYear, aptMonth, aptDay);
            aptDateLocal.setHours(0, 0, 0, 0);
            
            return aptDateLocal >= startDate && aptDateLocal <= endDate;
          }
        );

        setDoctorAppointments(filtered);
      } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        setDoctorAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchDoctorAppointments();
  }, [formData.doctorId, currentMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (availabilityWarning) {
      alert('⚠️ Impossible de créer le rendez-vous : Le médecin sélectionné est occupé à cette heure. Veuillez choisir une autre heure.');
      return;
    }
    
    setLoading(true);

    try {
      const appointmentData: any = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
      };

      if (formData.etageId) appointmentData.etageId = formData.etageId;
      if (formData.blocId) appointmentData.blocId = formData.blocId;
      if (formData.salleId) appointmentData.salleId = formData.salleId;
      if (formData.reason) appointmentData.reason = formData.reason;
      if (formData.notes) appointmentData.notes = formData.notes;
      
      if (appointment) {
        await appointmentService.update(appointment.id, appointmentData);
        alert('✅ Rendez-vous modifié avec succès !');
      } else {
        const createdAppointment = await appointmentService.create(appointmentData);
        console.log('✅ Rendez-vous créé avec succès:', createdAppointment);
        alert('✅ Rendez-vous créé avec succès !');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde du rendez-vous:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la sauvegarde';
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#3B9AEE] to-[#60A5FA]">
          <h2 className="text-2xl font-bold text-white">
            {appointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient *
            </label>
            <select
              required
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent"
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Médecin *
            </label>
            {loadingDoctors ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Chargement des médecins...
              </div>
            ) : allDoctors.length === 0 ? (
              <div className="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-700">
                Aucun médecin enregistré dans le système
              </div>
            ) : (
              <select
                required
                value={formData.doctorId}
                onChange={(e) => {
                  setFormData({ ...formData, doctorId: e.target.value });
                  setAvailabilityWarning(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent"
              >
                <option value="">Sélectionner un médecin</option>
                {allDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                    {doctor.specialty && ` - ${doctor.specialty}`}
                  </option>
                ))}
              </select>
            )}
            {availabilityWarning && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center space-x-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{availabilityWarning}</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durée (minutes) *
            </label>
            <input
              type="number"
              required
              min="15"
              step="15"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison de la consultation
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : appointment ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
