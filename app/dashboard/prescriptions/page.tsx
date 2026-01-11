'use client';

import { useEffect, useState } from 'react';
import { prescriptionService } from '@/services/prescriptionService';
import { patientService } from '@/services/patientService';
import { doctorService } from '@/services/doctorService';
import { Prescription, Patient, User } from '@/types';
import { Plus, FileText, Search, Download, Trash2, Edit, LayoutGrid, History, Printer } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { generatePrescriptionPDF } from '@/lib/pdfGenerator';

export default function PrescriptionsPage() {
  const user = useAuthStore((state) => state.user);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'interface' | 'historique'>('interface');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const data = await prescriptionService.getAll();
      setPrescriptions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous supprimer cette ordonnance ?')) {
      try {
        await prescriptionService.delete(id);
        fetchPrescriptions();
      } catch (error) {
        console.error('Error deleting prescription:', error);
      }
    }
  };

  const handlePrint = (prescription: Prescription) => {
    generatePrescriptionPDF({
      patientName: `${prescription.patient?.firstName} ${prescription.patient?.lastName}`,
      doctorName: `Dr. ${prescription.doctor?.firstName} ${prescription.doctor?.lastName}`,
      date: new Date(prescription.createdAt).toLocaleDateString('fr-FR'),
      medications: prescription.medications || [],
      instructions: prescription.instructions || '',
    });
  };

  // Filtrer
  const filteredPrescriptions = prescriptions.filter(p => {
    const patientName = `${p.patient?.firstName || ''} ${p.patient?.lastName || ''}`.toLowerCase();
    return patientName.includes(searchTerm.toLowerCase());
  });

  // Stats
  const totalPrescriptions = prescriptions.length;
  const todayPrescriptions = prescriptions.filter(p => {
    const today = new Date().toISOString().split('T')[0];
    return new Date(p.createdAt).toISOString().split('T')[0] === today;
  }).length;
  const thisMonth = prescriptions.filter(p => {
    const now = new Date();
    const pDate = new Date(p.createdAt);
    return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
  }).length;

  // Pagination
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const paginatedPrescriptions = filteredPrescriptions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <div className="w-10 h-10 bg-[#FF6B6B] rounded-lg flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Traitements</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#3B9AEE]">
              <p className="text-gray-600 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-800">{totalPrescriptions}</p>
            </div>
            <div className="bg-[#E4FFE9] rounded-xl p-4 text-center border-2 border-[#4ADE80]">
              <p className="text-gray-600 text-sm font-medium">Aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-800">{todayPrescriptions}</p>
            </div>
            <div className="bg-[#F3E8FF] rounded-xl p-4 text-center border-2 border-[#A855F7]">
              <p className="text-gray-600 text-sm font-medium">Ce Mois</p>
              <p className="text-3xl font-bold text-gray-800">{thisMonth}</p>
            </div>
            <div className="bg-[#FFE4E8] rounded-xl p-4 text-center border-2 border-[#FF6B8A]">
              <p className="text-gray-600 text-sm font-medium">Actifs</p>
              <p className="text-3xl font-bold text-gray-800">{prescriptions.filter(p => p.status === 'active').length}</p>
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
            <button onClick={() => { setEditingPrescription(null); setShowModal(true); }} className="flex items-center space-x-2 bg-[#4ADE80] text-white px-4 py-2 rounded-lg hover:bg-[#3ACC70] transition-all">
              <Plus className="w-4 h-4" />
              <span>Nouvelle Ordonnance</span>
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
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Médicaments</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Statut</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Chargement...</td></tr>
              ) : paginatedPrescriptions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Aucune ordonnance trouvée</td></tr>
              ) : (
                paginatedPrescriptions.map((prescription, index) => (
                  <tr key={prescription.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-3"><span className="font-medium text-gray-800">{prescription.patient?.firstName} {prescription.patient?.lastName}</span></td>
                    <td className="px-4 py-3 text-gray-600">Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}</td>
                    <td className="px-4 py-3"><span className="text-[#3B9AEE] font-medium">{new Date(prescription.createdAt).toLocaleDateString('fr-FR')}</span></td>
                    <td className="px-4 py-3 text-gray-600">{prescription.medications?.length || 0} médicament(s)</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        prescription.status === 'active' ? 'bg-[#E4FFE9] text-[#4ADE80]' :
                        prescription.status === 'completed' ? 'bg-[#E0F4FF] text-[#3B9AEE]' :
                        'bg-[#FFE4E4] text-[#FF6B6B]'
                      }`}>
                        {prescription.status === 'active' ? 'Actif' : prescription.status === 'completed' ? 'Terminé' : 'Annulé'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handlePrint(prescription)} className="p-2 bg-[#A855F7] text-white rounded-lg hover:bg-[#9333EA] transition-all" title="Imprimer">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditingPrescription(prescription); setShowModal(true); }} className="p-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] transition-all" title="Modifier">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(prescription.id)} className="p-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-all" title="Supprimer">
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
          <p className="text-sm text-gray-600">Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredPrescriptions.length)}-{Math.min(currentPage * itemsPerPage, filteredPrescriptions.length)} of {filteredPrescriptions.length} rows</p>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">First</button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
            <span className="px-3 py-1 bg-[#3B9AEE] text-white rounded font-medium">{currentPage}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Last</button>
          </div>
        </div>
      </div>

      {showModal && <PrescriptionModal prescription={editingPrescription} currentUser={user} onClose={() => { setShowModal(false); setEditingPrescription(null); }} onSuccess={fetchPrescriptions} />}
    </div>
  );
}

function PrescriptionModal({ prescription, currentUser, onClose, onSuccess }: { prescription: Prescription | null; currentUser: User | null; onClose: () => void; onSuccess: () => void; }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    patientId: prescription?.patientId || '',
    doctorId: prescription?.doctorId || currentUser?.id || '',
    medications: prescription?.medications || [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: prescription?.instructions || '',
    status: prescription?.status || 'active',
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

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedication = (index: number) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== index)
    });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = [...formData.medications];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, medications: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (prescription) {
        await prescriptionService.update(prescription.id, formData);
      } else {
        await prescriptionService.create(formData);
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#3B9AEE] to-[#60A5FA]">
          <h2 className="text-2xl font-bold text-white">{prescription ? 'Modifier' : 'Nouvelle'} ordonnance</h2>
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Médicaments</label>
              <button type="button" onClick={addMedication} className="text-sm text-[#3B9AEE] hover:underline">+ Ajouter</button>
            </div>
            <div className="space-y-3">
              {formData.medications.map((med, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                  <input type="text" placeholder="Nom" value={med.name} onChange={(e) => updateMedication(index, 'name', e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" placeholder="Dosage" value={med.dosage} onChange={(e) => updateMedication(index, 'dosage', e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" placeholder="Fréquence" value={med.frequency} onChange={(e) => updateMedication(index, 'frequency', e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" placeholder="Durée" value={med.duration} onChange={(e) => updateMedication(index, 'duration', e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  {formData.medications.length > 1 && (
                    <button type="button" onClick={() => removeMedication(index)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] disabled:opacity-50">{loading ? 'Enregistrement...' : prescription ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
