'use client';

import { useEffect, useState } from 'react';
import { etageService } from '@/services/etageService';
import { Etage } from '@/types';
import { Plus, Edit, Trash2, Building, Search, Layers } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function EtagesPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const [etages, setEtages] = useState<Etage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEtage, setEditingEtage] = useState<Etage | null>(null);

  // Vérifier si l'utilisateur est admin
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Accès non autorisé. Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchEtages();
  }, []);

  const fetchEtages = async () => {
    try {
      setLoading(true);
      const data = await etageService.getAll();
      setEtages(data || []);
    } catch (error: any) {
      console.error('Error fetching etages:', error);
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || 'Erreur lors du chargement des étages';
      
      if (error?.response?.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
        window.location.href = '/login';
        return;
      }
      
      alert(`Erreur: ${errorMessage}`);
      setEtages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet étage ? Cette action supprimera également tous les blocs et salles associés.')) {
      return;
    }

    try {
      await etageService.delete(id);
      fetchEtages();
    } catch (error: any) {
      console.error('Error deleting etage:', error);
      const errorMessage = error?.response?.data?.message || 'Erreur lors de la suppression de l\'étage';
      alert(errorMessage);
    }
  };

  const filteredEtages = etages.filter((etage) =>
    etage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (etage.floorNumber !== undefined && etage.floorNumber !== null && 
     etage.floorNumber.toString().includes(searchTerm))
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des étages</h1>
          <p className="text-gray-600 mt-2">Créer et gérer les étages de la clinique</p>
        </div>
        <button
          onClick={() => {
            setEditingEtage(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvel étage</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un étage par nom ou numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Liste des étages */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : filteredEtages.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <Layers className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            {searchTerm ? 'Aucun étage trouvé' : 'Aucun étage créé. Créez votre premier étage.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro d'étage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blocs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEtages.map((etage) => (
                  <tr key={etage.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Layers className="w-5 h-5 text-primary-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{etage.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {etage.floorNumber !== undefined && etage.floorNumber !== null ? (
                          <span className="font-medium">Étage {etage.floorNumber}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {etage.blocs && etage.blocs.length > 0 ? (
                          <span className="font-medium">{etage.blocs.length} bloc{etage.blocs.length > 1 ? 's' : ''}</span>
                        ) : (
                          <span className="text-gray-400">Aucun bloc</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {etage.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingEtage(etage);
                            setShowModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(etage.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal pour créer/modifier un étage */}
      {showModal && (
        <EtageModal
          etage={editingEtage}
          onClose={() => {
            setShowModal(false);
            setEditingEtage(null);
          }}
          onSuccess={() => {
            fetchEtages();
            setShowModal(false);
            setEditingEtage(null);
          }}
        />
      )}
    </div>
  );
}

// Modal pour créer/modifier un étage
function EtageModal({
  etage,
  onClose,
  onSuccess,
}: {
  etage: Etage | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: etage?.name || '',
    description: etage?.description || '',
    floorNumber: etage?.floorNumber?.toString() || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (etage) {
      setFormData({
        name: etage.name || '',
        description: etage.description || '',
        floorNumber: etage.floorNumber?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        floorNumber: '',
      });
    }
  }, [etage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Le nom de l\'étage est requis');
      return;
    }

    setLoading(true);
    try {
      const etageData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : undefined,
      };

      if (etage) {
        await etageService.update(etage.id, etageData);
        alert('✅ Étage modifié avec succès !');
      } else {
        await etageService.create(etageData);
        alert('✅ Étage créé avec succès !');
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving etage:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de la sauvegarde de l\'étage';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {etage ? 'Modifier l\'étage' : 'Nouvel étage'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {etage ? 'Modifiez les informations de l\'étage' : 'Créez un nouvel étage pour votre clinique'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'étage *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Rez-de-chaussée, 1er étage, 2ème étage..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Numéro d'étage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro d'étage
            </label>
            <input
              type="number"
              value={formData.floorNumber}
              onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
              placeholder="Ex: 0 pour rez-de-chaussée, 1 pour 1er étage..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Numéro d'étage (0 = rez-de-chaussée, 1 = 1er étage, etc.)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Description de l'étage, services disponibles..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : etage ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}













