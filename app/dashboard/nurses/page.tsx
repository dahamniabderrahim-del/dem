'use client';

import { useEffect, useState } from 'react';
import { nurseService } from '@/services/nurseService';
import { patientService } from '@/services/patientService';
import { User, Patient } from '@/types';
import { Plus, Search, Download, Trash2, Edit, LayoutGrid, History, Phone, Mail, Heart, Users, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function NursesPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const [nurses, setNurses] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNurse, setEditingNurse] = useState<User | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'interface' | 'historique'>('interface');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchNurses();
  }, []);

  const fetchNurses = async () => {
    try {
      const data = await nurseService.getAll();
      setNurses(data);
    } catch (error) {
      console.error('Error fetching nurses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous supprimer cet infirmier ?')) {
      try {
        await nurseService.delete(id);
        fetchNurses();
      } catch (error) {
        console.error('Error deleting nurse:', error);
      }
    }
  };

  // Filtrer
  const filteredNurses = nurses.filter(nurse => {
    const fullName = `${nurse.firstName} ${nurse.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || nurse.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Stats
  const totalNurses = nurses.length;
  const activeNurses = nurses.filter(n => n.isActive !== false).length;

  // Pagination
  const totalPages = Math.ceil(filteredNurses.length / itemsPerPage);
  const paginatedNurses = filteredNurses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!user) {
    return <div className="text-center py-12"><p className="text-red-600">Accès non autorisé</p></div>;
  }

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
            <div className="w-10 h-10 bg-[#FF6B8A] rounded-lg flex items-center justify-center text-white">
              <Heart className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Infirmiers</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#3B9AEE]">
              <p className="text-gray-600 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-800">{totalNurses}</p>
            </div>
            <div className="bg-[#E4FFE9] rounded-xl p-4 text-center border-2 border-[#4ADE80]">
              <p className="text-gray-600 text-sm font-medium">Actifs</p>
              <p className="text-3xl font-bold text-gray-800">{activeNurses}</p>
            </div>
            <div className="bg-[#FFE4E8] rounded-xl p-4 text-center border-2 border-[#FF6B8A]">
              <p className="text-gray-600 text-sm font-medium">En service</p>
              <p className="text-3xl font-bold text-gray-800">{activeNurses}</p>
            </div>
            <div className="bg-[#FFF8E0] rounded-xl p-4 text-center border-2 border-[#FBBF24]">
              <p className="text-gray-600 text-sm font-medium">Disponibles</p>
              <p className="text-3xl font-bold text-gray-800">{activeNurses}</p>
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
            {isAdmin && (
              <button onClick={() => { setEditingNurse(null); setShowModal(true); }} className="flex items-center space-x-2 bg-[#4ADE80] text-white px-4 py-2 rounded-lg hover:bg-[#3ACC70] transition-all">
                <Plus className="w-4 h-4" />
                <span>Nouveau Infirmier</span>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#3B9AEE] to-[#60A5FA]">
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">#</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Infirmier</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Téléphone</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Email</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Statut</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Inscrit le</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Chargement...</td></tr>
              ) : paginatedNurses.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Aucun infirmier trouvé</td></tr>
              ) : (
                paginatedNurses.map((nurse, index) => (
                  <tr key={nurse.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-3"><span className="font-medium text-gray-800">{nurse.firstName} {nurse.lastName}</span></td>
                    <td className="px-4 py-3"><div className="flex items-center space-x-2 text-gray-600"><Phone className="w-4 h-4 text-gray-400" /><span>{nurse.phone || '-'}</span></div></td>
                    <td className="px-4 py-3"><div className="flex items-center space-x-2 text-gray-600"><Mail className="w-4 h-4 text-gray-400" /><span>{nurse.email || '-'}</span></div></td>
                    <td className="px-4 py-3"><span className={`px-3 py-1 rounded-md text-xs font-semibold ${nurse.isActive !== false ? 'bg-[#E4FFE9] text-[#4ADE80]' : 'bg-[#FFE4E4] text-[#FF6B6B]'}`}>{nurse.isActive !== false ? 'Actif' : 'Inactif'}</span></td>
                    <td className="px-4 py-3 text-gray-600">{new Date(nurse.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => { setSelectedNurse(nurse); setShowAssignmentModal(true); }} className="p-2 bg-[#A855F7] text-white rounded-lg hover:bg-[#9333EA] transition-all" title="Affecter patients">
                          <Users className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <>
                            <button onClick={() => { setEditingNurse(nurse); setShowModal(true); }} className="p-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] transition-all">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(nurse.id)} className="p-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
          <p className="text-sm text-gray-600">Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredNurses.length)}-{Math.min(currentPage * itemsPerPage, filteredNurses.length)} of {filteredNurses.length} rows</p>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">First</button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
            <span className="px-3 py-1 bg-[#3B9AEE] text-white rounded font-medium">{currentPage}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Last</button>
          </div>
        </div>
      </div>

      {showModal && isAdmin && <NurseModal nurse={editingNurse} onClose={() => { setShowModal(false); setEditingNurse(null); }} onSuccess={fetchNurses} />}
      {showAssignmentModal && selectedNurse && <NurseAssignmentModal nurse={selectedNurse} onClose={() => { setShowAssignmentModal(false); setSelectedNurse(null); }} />}
    </div>
  );
}

function NurseModal({ nurse, onClose, onSuccess }: { nurse: User | null; onClose: () => void; onSuccess: () => void; }) {
  const [formData, setFormData] = useState({ email: nurse?.email || '', password: '', firstName: nurse?.firstName || '', lastName: nurse?.lastName || '', phone: nurse?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurse && !formData.password) { alert('Mot de passe requis'); return; }
    setLoading(true);
    try {
      if (nurse) {
        const updateData: any = { ...formData };
        if (!updateData.password) delete updateData.password;
        await nurseService.update(nurse.id, updateData);
      } else {
        await nurseService.create(formData);
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
          <h2 className="text-2xl font-bold text-white">{nurse ? 'Modifier' : 'Nouveau'} infirmier</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label><input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label><input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe {nurse ? '' : '*'}</label><input type="password" required={!nurse} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" placeholder={nurse ? 'Laisser vide' : ''} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" /></div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] disabled:opacity-50">{loading ? 'Enregistrement...' : nurse ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NurseAssignmentModal({ nurse, onClose }: { nurse: User; onClose: () => void; }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [assignedPatients, setAssignedPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  useEffect(() => { fetchData(); }, [nurse.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsData, assignedData] = await Promise.all([
        patientService.getAll(),
        fetch(`/api/nurses/${nurse.id}/patients`, { headers: { 'Authorization': `Bearer ${useAuthStore.getState().token}` } }).then(res => res.ok ? res.json() : [])
      ]);
      setPatients(patientsData);
      setAssignedPatients(assignedData || []);
    } catch (error) {
      console.error('Error:', error);
      setAssignedPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPatientId) return;
    setAssigning(true);
    try {
      await fetch(`/api/patients/${selectedPatientId}/nurses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify({ nurseId: nurse.id })
      });
      fetchData();
      setSelectedPatientId('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (patientId: string) => {
    if (!confirm('Retirer cette affectation ?')) return;
    try {
      await fetch(`/api/patients/${patientId}/nurses?nurseId=${nurse.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${useAuthStore.getState().token}` } });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const availablePatients = patients.filter(p => !assignedPatients.some(ap => ap.patient?.id === p.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#A855F7] to-[#9333EA]">
          <h2 className="text-2xl font-bold text-white">Affectation - {nurse.firstName} {nurse.lastName}</h2>
        </div>
        <div className="p-6 space-y-6">
          {loading ? <div className="text-center py-8">Chargement...</div> : (
            <>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Assigner un patient</h3>
                <div className="flex space-x-4">
                  <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Sélectionner</option>
                    {availablePatients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                  <button onClick={handleAssign} disabled={!selectedPatientId || assigning} className="px-4 py-2 bg-[#3B9AEE] text-white rounded-lg disabled:opacity-50">{assigning ? '...' : 'Assigner'}</button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Patients assignés ({assignedPatients.length})</h3>
                {assignedPatients.length === 0 ? <p className="text-gray-500 text-center py-4">Aucun patient</p> : (
                  <div className="space-y-2">
                    {assignedPatients.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <span>{a.patient?.firstName} {a.patient?.lastName}</span>
                        <button onClick={() => handleRemove(a.patient?.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          <div className="flex justify-end pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
