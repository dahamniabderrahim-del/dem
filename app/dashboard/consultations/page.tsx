'use client';

import { useEffect, useState } from 'react';
import { consultationService } from '@/services/consultationService';
import { appointmentService } from '@/services/appointmentService';
import { patientService } from '@/services/patientService';
import { doctorService } from '@/services/doctorService';
import { Appointment, Consultation, Patient, User } from '@/types';
import { Stethoscope, Download, LayoutGrid, History, Calendar, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ConsultationsPage() {
  const user = useAuthStore((state) => state.user);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [currentAppointmentLoading, setCurrentAppointmentLoading] = useState(true);
  const [startingVisit, setStartingVisit] = useState(false);
  const [cancellingVisit, setCancellingVisit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState<'interface' | 'historique'>('interface');

  useEffect(() => {
    fetchConsultations();
    fetchCurrentAppointment();
  }, [user?.id, user?.role]);

  const fetchConsultations = async () => {
    try {
      const data = await consultationService.getAll();
      setConsultations(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.MAX_SAFE_INTEGER;
    return hours * 60 + minutes;
  };

  const pickCurrentAppointment = (appointments: Appointment[]) => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const sorted = [...appointments].sort((a, b) => getTimeMinutes(a.time) - getTimeMinutes(b.time));
    const upcoming = sorted.find((appointment) => getTimeMinutes(appointment.time) >= nowMinutes);
    return upcoming || sorted[0] || null;
  };

  const fetchCurrentAppointment = async () => {
    setCurrentAppointmentLoading(true);
    try {
      const today = new Date();
      const data = await appointmentService.getByDate(today);
      let filtered = data.filter(
        (appointment) => appointment.status === 'scheduled' || appointment.status === 'in_progress'
      );

      if (user?.role === 'medecin' && user.id) {
        filtered = filtered.filter((appointment) => appointment.doctorId === user.id);
      }

      setCurrentAppointment(pickCurrentAppointment(filtered));
    } catch (error) {
      console.error('Error fetching current appointment:', error);
      setCurrentAppointment(null);
    } finally {
      setCurrentAppointmentLoading(false);
    }
  };

  const handleStartVisit = async () => {
    if (!currentAppointment || startingVisit) return;
    setStartingVisit(true);
    try {
      const updatedAppointment = await appointmentService.update(currentAppointment.id, {
        status: 'in_progress',
      });
      setCurrentAppointment(updatedAppointment);
    } catch (error) {
      console.error('Error starting visit:', error);
    } finally {
      setStartingVisit(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!currentAppointment || cancellingVisit) return;
    if (!confirm('Voulez-vous annuler ce rendez-vous ?')) return;
    setCancellingVisit(true);
    try {
      const updatedAppointment = await appointmentService.cancel(currentAppointment.id);
      setCurrentAppointment(updatedAppointment);
      fetchCurrentAppointment();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setCancellingVisit(false);
    }
  };

  // Stats
  const totalConsultations = consultations.length;
  const todayConsultations = consultations.filter(c => {
    const today = new Date().toISOString().split('T')[0];
    return new Date(c.date).toISOString().split('T')[0] === today;
  }).length;
  const thisWeek = consultations.filter(c => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return new Date(c.date) >= weekAgo;
  }).length;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Tabs */}
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => { setActiveTab('interface'); }} className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'interface' ? 'bg-[#3B9AEE] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          <LayoutGrid className="w-4 h-4" />
          <span>Interface</span>
        </button>
        <button onClick={() => { setActiveTab('historique'); }} className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'historique' ? 'bg-[#3B9AEE] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          <History className="w-4 h-4" />
          <span>Historique</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[#4ADE80] rounded-lg flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Visites</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#3B9AEE]">
              <p className="text-gray-600 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-800">{totalConsultations}</p>
            </div>
            <div className="bg-[#E4FFE9] rounded-xl p-4 text-center border-2 border-[#4ADE80]">
              <p className="text-gray-600 text-sm font-medium">Aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-800">{todayConsultations}</p>
            </div>
            <div className="bg-[#F3E8FF] rounded-xl p-4 text-center border-2 border-[#A855F7]">
              <p className="text-gray-600 text-sm font-medium">Cette Semaine</p>
              <p className="text-3xl font-bold text-gray-800">{thisWeek}</p>
            </div>
            <div className="bg-[#FFF8E0] rounded-xl p-4 text-center border-2 border-[#FBBF24]">
              <p className="text-gray-600 text-sm font-medium">Ce Mois</p>
              <p className="text-3xl font-bold text-gray-800">{consultations.filter(c => {
                const now = new Date();
                const cDate = new Date(c.date);
                return cDate.getMonth() === now.getMonth() && cDate.getFullYear() === now.getFullYear();
              }).length}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-[#3B9AEE] text-white px-4 py-2 rounded-lg hover:bg-[#2D8AD8] transition-all">
              <Download className="w-4 h-4" />
              <span>T?l?charger PDF</span>
            </button>
          </div>

          {/* Current Appointment */}
          <div className="mt-6 rounded-xl border border-gray-100 bg-[#F8FAFC] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#3B9AEE]" />
                <h2 className="text-sm font-semibold text-gray-700">Rendez-vous actuel</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="flex items-center space-x-2 bg-[#4ADE80] text-white px-3 py-2 rounded-lg hover:bg-[#3ACC70] transition-all text-sm"
                  onClick={() => {
                    handleStartVisit();
                    setEditingConsultation(null);
                    setShowModal(true);
                  }}
                  disabled={!currentAppointment || startingVisit}
                >
                  <span>Debut de visite</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-2 bg-[#FF6B6B] text-white px-3 py-2 rounded-lg hover:bg-[#FF5252] transition-all text-sm"
                  onClick={handleCancelAppointment}
                  disabled={!currentAppointment || cancellingVisit}
                >
                  <span>Annuler</span>
                </button>
              </div>
            </div>
            {currentAppointmentLoading ? (
              <p className="text-sm text-gray-500 mt-2">Chargement...</p>
            ) : currentAppointment ? (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-gray-100 bg-white p-3">
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {currentAppointment.patient?.firstName} {currentAppointment.patient?.lastName}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white p-3">
                  <p className="text-xs text-gray-500">M?decin</p>
                  <p className="text-sm font-semibold text-gray-800">
                    Dr. {currentAppointment.doctor?.firstName} {currentAppointment.doctor?.lastName}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white p-3">
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Heure</span>
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(currentAppointment.date).toLocaleDateString('fr-FR')} {currentAppointment.time}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Aucun rendez-vous actuel pour aujourd'hui.</p>
            )}
          </div>
        </div>

      </div>

      {showModal && <ConsultationModal consultation={editingConsultation} currentUser={user} onClose={() => { setShowModal(false); setEditingConsultation(null); }} onSuccess={fetchConsultations} />}
    </div>
  );
}

function ConsultationModal({ consultation, currentUser, onClose, onSuccess }: { consultation: Consultation | null; currentUser: User | null; onClose: () => void; onSuccess: () => void; }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [formData, setFormData] = useState<{
    patientId: string;
    doctorId: string;
    date: string;
    diagnosis: string;
    treatment: string;
    notes: string;
    status: Consultation['status'];
  }>({
    patientId: consultation?.patientId || '',
    doctorId: consultation?.doctorId || currentUser?.id || '',
    date: consultation?.date ? new Date(consultation.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    diagnosis: consultation?.diagnosis || '',
    treatment: consultation?.treatment || '',
    notes: consultation?.notes || '',
    status: consultation?.status || 'pending',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [patientsData, doctorsData] = await Promise.all([patientService.getAll(), doctorService.getAll()]);
      setPatients(patientsData);
      setDoctors(doctorsData);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date),
        status: formData.status as Consultation['status'],
      };
      if (consultation) {
        await consultationService.update(consultation.id, payload);
      } else {
        await consultationService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#3B9AEE] to-[#60A5FA]">
          <h2 className="text-2xl font-bold text-white">{consultation ? 'Modifier' : 'Nouvelle'} visite</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
              <select required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]">
                <option value="">Sélectionner</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Médecin *</label>
              <select required value={formData.doctorId} onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]">
                <option value="">Sélectionner</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Consultation['status'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]">
                <option value="pending">En attente</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnostic</label>
            <textarea value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Traitement</label>
            <textarea value={formData.treatment} onChange={(e) => setFormData({ ...formData, treatment: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] disabled:opacity-50">{loading ? 'Enregistrement...' : consultation ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
