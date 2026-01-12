'use client';

import { useEffect, useState } from 'react';
import { salleService } from '@/services/salleService';
import { blocService } from '@/services/blocService';
import { Salle, Bloc } from '@/types';
import { Plus, Edit, Trash2, DoorOpen, Search, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function SallesPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const [salles, setSalles] = useState<Salle[]>([]);
  const [blocs, setBlocs] = useState<Bloc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSalle, setEditingSalle] = useState<Salle | null>(null);

  // Vérifier si l'utilisateur est admin
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Accès non autorisé. Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchSalles();
    fetchBlocs();
  }, []);

  const fetchSalles = async () => {
    try {
      setLoading(true);
      const data = await salleService.getAll();
      setSalles(data || []);
    } catch (error: any) {
      console.error('Error fetching salles:', error);
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || 'Erreur lors du chargement des salles';
      
      if (error?.response?.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
        window.location.href = '/login';
        return;
      }
      
      alert(`Erreur: ${errorMessage}`);
      setSalles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocs = async () => {
    try {
      const data = await blocService.getAll();
      setBlocs(data || []);
    } catch (error) {
      console.error('Error fetching blocs:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      return;
    }

    try {
      await salleService.delete(id);
      fetchSalles();
    } catch (error: any) {
      console.error('Error deleting salle:', error);
      const errorMessage = error?.response?.data?.message || 'Erreur lors de la suppression de la salle';
      alert(errorMessage);
    }
  };

  const filteredSalles = salles.filter((salle) =>
    salle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salle.bloc?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salle.bloc?.etage?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des salles</h1>
          <p className="text-gray-600 mt-2">Créer et gérer les salles de la clinique</p>
        </div>
        <button
          onClick={() => {
            setEditingSalle(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle salle</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une salle par nom, bloc ou étage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Liste des salles */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : filteredSalles.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <DoorOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            {searchTerm ? 'Aucune salle trouvée' : 'Aucune salle créée. Créez votre première salle.'}
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
                    Bloc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacité
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
                {filteredSalles.map((salle) => (
                  <tr key={salle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DoorOpen className="w-5 h-5 text-primary-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{salle.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {salle.bloc ? (
                          <span className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                            {salle.bloc.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {salle.bloc?.etage ? (
                          <span>{salle.bloc.etage.name}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {salle.capacity ? `${salle.capacity} personnes` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {salle.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingSalle(salle);
                            setShowModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(salle.id)}
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

      {/* Modal pour créer/modifier une salle */}
      {showModal && (
        <SalleModal
          salle={editingSalle}
          blocs={blocs}
          onClose={() => {
            setShowModal(false);
            setEditingSalle(null);
          }}
          onSuccess={() => {
            fetchSalles();
            setShowModal(false);
            setEditingSalle(null);
          }}
        />
      )}
    </div>
  );
}

// Modal pour créer/modifier une salle
function SalleModal({
  salle,
  blocs,
  onClose,
  onSuccess,
}: {
  salle: Salle | null;
  blocs: Bloc[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: salle?.name || '',
    description: salle?.description || '',
    capacity: salle?.capacity?.toString() || '',
    equipment: salle?.equipment || '',
    blocId: salle?.blocId || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (salle) {
      setFormData({
        name: salle.name || '',
        description: salle.description || '',
        capacity: salle.capacity?.toString() || '',
        equipment: salle.equipment || '',
        blocId: salle.blocId || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        capacity: '',
        equipment: '',
        blocId: '',
      });
    }
  }, [salle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Le nom de la salle est requis');
      return;
    }

    if (!formData.blocId) {
      alert('Le bloc est requis');
      return;
    }

    setLoading(true);
    try {
      const salleData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        equipment: formData.equipment.trim() || undefined,
        blocId: formData.blocId,
      };

      if (salle) {
        await salleService.update(salle.id, salleData);
        alert('✅ Salle modifiée avec succès !');
      } else {
        await salleService.create(salleData);
        alert('✅ Salle créée avec succès !');
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving salle:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de la sauvegarde de la salle';
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
            {salle ? 'Modifier la salle' : 'Nouvelle salle'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {salle ? 'Modifiez les informations de la salle' : 'Créez une nouvelle salle pour votre clinique'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Bloc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bloc *
            </label>
            <select
              required
              value={formData.blocId}
              onChange={(e) => setFormData({ ...formData, blocId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sélectionner un bloc</option>
              {blocs.map((bloc) => (
                <option key={bloc.id} value={bloc.id}>
                  {bloc.name}
                  {bloc.etage && ` - ${bloc.etage.name}`}
                </option>
              ))}
            </select>
            {blocs.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Aucun bloc disponible. Veuillez d'abord créer un bloc.
              </p>
            )}
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la salle *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Salle 101, Salle d'opération 1..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Capacité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacité (nombre de personnes)
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="Ex: 10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Équipements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Équipements
            </label>
            <input
              type="text"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              placeholder="Ex: Table d'opération, Écran, Moniteur..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
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
              placeholder="Description de la salle, utilisation..."
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
              {loading ? 'Enregistrement...' : salle ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}












