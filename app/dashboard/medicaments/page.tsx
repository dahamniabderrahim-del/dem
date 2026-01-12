'use client';

import { useEffect, useState } from 'react';
import { medicamentService } from '@/services/medicamentService';
import { Medicament } from '@/types';
import { Plus, Pill, Search, Download, Trash2, Edit, LayoutGrid, History, AlertTriangle, Package } from 'lucide-react';

export default function MedicamentsPage() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMedicament, setEditingMedicament] = useState<Medicament | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'interface' | 'historique'>('interface');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMedicaments();
  }, []);

  const fetchMedicaments = async () => {
    try {
      const data = await medicamentService.getAll();
      setMedicaments(data);
    } catch (error) {
      console.error('Error fetching medicaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous supprimer ce médicament ?')) {
      try {
        await medicamentService.delete(id);
        fetchMedicaments();
      } catch (error) {
        console.error('Error deleting medicament:', error);
      }
    }
  };

  // Filtrer
  const filteredMedicaments = medicaments.filter(med =>
    med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalMedicaments = medicaments.length;
  const lowStock = medicaments.filter(m => (m.stock || 0) < (m.minStock || 10)).length;
  const expiringSoon = medicaments.filter(m => {
    if (!m.expiryDate) return false;
    const exp = new Date(m.expiryDate);
    const now = new Date();
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff > 0;
  }).length;
  const totalStock = medicaments.reduce((acc, m) => acc + (m.stock || 0), 0);

  // Pagination
  const totalPages = Math.ceil(filteredMedicaments.length / itemsPerPage);
  const paginatedMedicaments = filteredMedicaments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <div className="w-10 h-10 bg-[#A855F7] rounded-lg flex items-center justify-center text-white">
              <Pill className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion de la Pharmacie</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#3B9AEE]">
              <p className="text-gray-600 text-sm font-medium">Total Articles</p>
              <p className="text-3xl font-bold text-gray-800">{totalMedicaments}</p>
            </div>
            <div className="bg-[#FFF8E0] rounded-xl p-4 text-center border-2 border-[#FBBF24]">
              <p className="text-gray-600 text-sm font-medium">Stock Total</p>
              <p className="text-3xl font-bold text-gray-800">{totalStock}</p>
            </div>
            <div className="bg-[#FFE4E4] rounded-xl p-4 text-center border-2 border-[#FF6B6B]">
              <p className="text-gray-600 text-sm font-medium">Stock Faible</p>
              <p className="text-3xl font-bold text-gray-800">{lowStock}</p>
            </div>
            <div className="bg-[#FFEFD5] rounded-xl p-4 text-center border-2 border-[#FF8C00]">
              <p className="text-gray-600 text-sm font-medium">Expire Bientôt</p>
              <p className="text-3xl font-bold text-gray-800">{expiringSoon}</p>
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
            <button onClick={() => { setEditingMedicament(null); setShowModal(true); }} className="flex items-center space-x-2 bg-[#4ADE80] text-white px-4 py-2 rounded-lg hover:bg-[#3ACC70] transition-all">
              <Plus className="w-4 h-4" />
              <span>Nouveau Médicament</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#3B9AEE] to-[#60A5FA]">
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">#</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Nom</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Catégorie</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Stock</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Prix</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Expiration</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Statut</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Chargement...</td></tr>
              ) : paginatedMedicaments.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Aucun médicament trouvé</td></tr>
              ) : (
                paginatedMedicaments.map((med, index) => {
                  const isLowStock = (med.stock || 0) < (med.minStock || 10);
                  const isExpiringSoon = med.expiryDate && ((new Date(med.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 30;
                  return (
                    <tr key={med.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">{med.name}</span>
                          {(isLowStock || isExpiringSoon) && <AlertTriangle className="w-4 h-4 text-[#FF6B6B]" />}
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="px-3 py-1 bg-[#F3E8FF] text-[#A855F7] rounded-md text-xs font-semibold">{med.category || 'Non catégorisé'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className={`font-medium ${isLowStock ? 'text-[#FF6B6B]' : 'text-gray-800'}`}>{med.stock || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{med.price ? `${med.price} DA` : '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{med.expiryDate ? new Date(med.expiryDate).toLocaleDateString('fr-FR') : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                          isLowStock ? 'bg-[#FFE4E4] text-[#FF6B6B]' :
                          isExpiringSoon ? 'bg-[#FFF8E0] text-[#FBBF24]' :
                          'bg-[#E4FFE9] text-[#4ADE80]'
                        }`}>
                          {isLowStock ? 'Stock Faible' : isExpiringSoon ? 'Expire Bientôt' : 'OK'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => { setEditingMedicament(med); setShowModal(true); }} className="p-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] transition-all"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(med.id)} className="p-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredMedicaments.length)}-{Math.min(currentPage * itemsPerPage, filteredMedicaments.length)} of {filteredMedicaments.length} rows</p>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">First</button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
            <span className="px-3 py-1 bg-[#3B9AEE] text-white rounded font-medium">{currentPage}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Last</button>
          </div>
        </div>
      </div>

      {showModal && <MedicamentModal medicament={editingMedicament} onClose={() => { setShowModal(false); setEditingMedicament(null); }} onSuccess={fetchMedicaments} />}
    </div>
  );
}

function MedicamentModal({ medicament, onClose, onSuccess }: { medicament: Medicament | null; onClose: () => void; onSuccess: () => void; }) {
  const [formData, setFormData] = useState({
    name: medicament?.name || '',
    category: medicament?.category || '',
    description: medicament?.description || '',
    stock: medicament?.stock || 0,
    minStock: medicament?.minStock || 10,
    price: medicament?.price || 0,
    expiryDate: medicament?.expiryDate ? new Date(medicament.expiryDate).toISOString().split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      };
      if (medicament) {
        await medicamentService.update(medicament.id, payload);
      } else {
        await medicamentService.create(payload);
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
          <h2 className="text-2xl font-bold text-white">{medicament ? 'Modifier' : 'Nouveau'} médicament</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label><input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock Min</label><input type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Prix (DA)</label><input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label><input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" /></div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] disabled:opacity-50">{loading ? 'Enregistrement...' : medicament ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
