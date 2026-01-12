'use client';

import { useEffect, useState } from 'react';
import { consultationService } from '@/services/consultationService';
import { patientService } from '@/services/patientService';
import { doctorService } from '@/services/doctorService';
import { Consultation, Patient, User } from '@/types';
import { Plus, Stethoscope, Search, Download, Trash2, Edit, LayoutGrid, History, Eye, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ConsultationsPage() {
  const user = useAuthStore((state) => state.user);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'interface' | 'historique'>('interface');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchConsultations();
  }, []);

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

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous supprimer cette consultation ?')) {
      try {
        await consultationService.delete(id);
        fetchConsultations();
      } catch (error) {
        console.error('Error deleting consultation:', error);
      }
    }
  };

  // Filtrer
  const filteredConsultations = consultations.filter(c => {
    const patientName = `${c.patient?.firstName || ''} ${c.patient?.lastName || ''}`.toLowerCase();
    const doctorName = `${c.doctor?.firstName || ''} ${c.doctor?.lastName || ''}`.toLowerCase();
    return patientName.includes(searchTerm.toLowerCase()) || 
           doctorName.includes(searchTerm.toLowerCase()) ||
           c.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

  // Pagination
  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
  const paginatedConsultations = filteredConsultations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Tabs */}
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => { setActiveTab('interface'); setCurrentPage(1); }} className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'interface' ? 'bg-[#3B9AEE] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          <LayoutGrid className="w-4 h-4" />
          <span>Interface</span>
        </button>
        <button onClick={() => { setActiveTab('historique'); setCurrentPage(1); }} className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'historique' ? 'bg-[#3B9AEE] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-[#3B9AEE] text-white px-4 py-2 rounded-lg hover:bg-[#2D8AD8] transition-all">
                <Download className="w-4 h-4" />
                <span>Télécharger PDF</span>
              </button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent" />
              </div>
            </div>
            <button onClick={() => { setEditingConsultation(null); setShowModal(true); }} className="flex items-center space-x-2 bg-[#4ADE80] text-white px-4 py-2 rounded-lg hover:bg-[#3ACC70] transition-all">
              <Plus className="w-4 h-4" />
              <span>Nouvelle Visite</span>
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
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Médecin</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Date</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Diagnostic</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Statut</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Chargement...</td></tr>
              ) : paginatedConsultations.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Aucune consultation trouvée</td></tr>
              ) : (
                paginatedConsultations.map((consultation, index) => (
                  <tr key={consultation.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-3"><span className="font-medium text-gray-800">{consultation.patient?.firstName} {consultation.patient?.lastName}</span></td>
                    <td className="px-4 py-3 text-gray-600">Dr. {consultation.doctor?.firstName} {consultation.doctor?.lastName}</td>
                    <td className="px-4 py-3"><span className="text-[#3B9AEE] font-medium">{new Date(consultation.date).toLocaleDateString('fr-FR')}</span></td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{consultation.diagnosis || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        consultation.status === 'completed' ? 'bg-[#E4FFE9] text-[#4ADE80]' :
                        consultation.status === 'pending' ? 'bg-[#FFF8E0] text-[#FBBF24]' :
                        'bg-[#E0F4FF] text-[#3B9AEE]'
                      }`}>
                        {consultation.status === 'completed' ? 'Terminé' : consultation.status === 'pending' ? 'En attente' : 'En cours'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => { setEditingConsultation(consultation); setShowModal(true); }} className="p-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] transition-all" title="Modifier">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(consultation.id)} className="p-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-all" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredConsultations.length)}-{Math.min(currentPage * itemsPerPage, filteredConsultations.length)} of {filteredConsultations.length} rows</p>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">First</button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
            <span className="px-3 py-1 bg-[#3B9AEE] text-white rounded font-medium">{currentPage}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Last</button>
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
