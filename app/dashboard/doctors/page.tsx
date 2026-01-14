'use client';

import { useEffect, useState } from 'react';
import { doctorService } from '@/services/doctorService';
import { User } from '@/types';
import { Plus, UserPlus, Search, Download, Trash2, Edit, LayoutGrid, History, Phone, Mail, Stethoscope } from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'interface' | 'historique'>('interface');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous supprimer ce médecin ?')) {
      try {
        await doctorService.delete(id);
        fetchDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  // Filtrer les médecins
  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           doctor.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Stats
  const totalDoctors = doctors.length;
  const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))];
  const activeDoctors = doctors.filter(d => d.isActive !== false).length;

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <div className="w-10 h-10 bg-[#4ADE80] rounded-lg flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Médecins</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#3B9AEE]">
              <p className="text-gray-600 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-800">{totalDoctors}</p>
            </div>
            <div className="bg-[#E4FFE9] rounded-xl p-4 text-center border-2 border-[#4ADE80]">
              <p className="text-gray-600 text-sm font-medium">Actifs</p>
              <p className="text-3xl font-bold text-gray-800">{activeDoctors}</p>
            </div>
            <div className="bg-[#F3E8FF] rounded-xl p-4 text-center border-2 border-[#A855F7]">
              <p className="text-gray-600 text-sm font-medium">Spécialités</p>
              <p className="text-3xl font-bold text-gray-800">{specialties.length}</p>
            </div>
            <div className="bg-[#FFF8E0] rounded-xl p-4 text-center border-2 border-[#FBBF24]">
              <p className="text-gray-600 text-sm font-medium">Disponibles</p>
              <p className="text-3xl font-bold text-gray-800">{activeDoctors}</p>
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
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => {
                setEditingDoctor(null);
                setShowModal(true);
              }}
              className="flex items-center space-x-2 bg-[#4ADE80] text-white px-4 py-2 rounded-lg hover:bg-[#3ACC70] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Médecin</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#3B9AEE] to-[#60A5FA]">
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">#</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Médecin</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Spécialité</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Téléphone</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Email</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Statut</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : paginatedDoctors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun médecin trouvé
                  </td>
                </tr>
              ) : (
                paginatedDoctors.map((doctor, index) => (
                  <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-[#F3E8FF] text-[#A855F7] rounded-md text-xs font-semibold">
                        {doctor.specialty || 'Généraliste'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{doctor.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{doctor.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        doctor.isActive !== false
                          ? 'bg-[#E4FFE9] text-[#4ADE80]'
                          : 'bg-[#FFE4E4] text-[#FF6B6B]'
                      }`}>
                        {doctor.isActive !== false ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingDoctor(doctor);
                            setShowModal(true);
                          }}
                          className="p-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
                          className="p-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-all"
                        >
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
          <p className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredDoctors.length)}-{Math.min(currentPage * itemsPerPage, filteredDoctors.length)} of {filteredDoctors.length} rows
          </p>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">First</button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
            <span className="px-3 py-1 bg-[#3B9AEE] text-white rounded font-medium">{currentPage}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Last</button>
          </div>
        </div>
      </div>

      {showModal && (
        <DoctorModal
          doctor={editingDoctor}
          onClose={() => { setShowModal(false); setEditingDoctor(null); }}
          onSuccess={fetchDoctors}
        />
      )}
    </div>
  );
}

function DoctorModal({ doctor, onClose, onSuccess }: { doctor: User | null; onClose: () => void; onSuccess: () => void; }) {
  const [formData, setFormData] = useState({
    email: doctor?.email || '',
    password: '',
    firstName: doctor?.firstName || '',
    lastName: doctor?.lastName || '',
    phone: doctor?.phone || '',
    specialty: doctor?.specialty || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (doctor) {
        const updateData: any = { ...formData };
        if (!updateData.password) delete updateData.password;
        await doctorService.update(doctor.id, updateData);
      } else {
        await doctorService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving doctor:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#3B9AEE] to-[#60A5FA]">
          <h2 className="text-2xl font-bold text-white">{doctor ? 'Modifier le médecin' : 'Nouveau médecin'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe {doctor ? '' : '*'}</label>
            <input type="password" required={!doctor} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent" placeholder={doctor ? 'Laisser vide pour ne pas modifier' : ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
              <input type="text" value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent" />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] disabled:opacity-50">{loading ? 'Enregistrement...' : doctor ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
