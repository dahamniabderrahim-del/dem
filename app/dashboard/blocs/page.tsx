'use client';

import { useEffect, useState } from 'react';
import { blocService } from '@/services/blocService';
import { etageService } from '@/services/etageService';
import { Bloc, Etage } from '@/types';
import { Plus, Edit, Trash2, Building2, Search } from 'lucide-react';

export default function BlocsPage() {
  const [blocs, setBlocs] = useState<Bloc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBloc, setEditingBloc] = useState<Bloc | null>(null);

  useEffect(() => {
    fetchBlocs();
  }, []);

  const fetchBlocs = async () => {
    try {
      setLoading(true);
      const data = await blocService.getAll();
      setBlocs(data || []);
    } catch (error: any) {
      console.error('Error fetching blocs:', error);
      const errorMessage = error?.response?.data?.message
        || error?.message
        || 'Erreur lors du chargement des blocs';

      if (error?.response?.status === 401) {
        alert('Session expiree. Veuillez vous reconnecter.');
        window.location.href = '/login';
        return;
      }

      alert(`Erreur: ${errorMessage}`);
      setBlocs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer ce bloc ?')) {
      return;
    }

    try {
      await blocService.delete(id);
      fetchBlocs();
    } catch (error) {
      console.error('Error deleting bloc:', error);
      alert('Erreur lors de la suppression du bloc');
    }
  };

  const filteredBlocs = blocs.filter((bloc) =>
    bloc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bloc.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bloc.etage?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bloc.etage?.floorNumber !== undefined && bloc.etage?.floorNumber !== null &&
     bloc.etage.floorNumber.toString().includes(searchTerm))
  );
  const totalSalles = blocs.reduce((sum, bloc) => sum + (bloc.salles?.length || 0), 0);
  const totalEtages = new Set(
    blocs
      .map((bloc) => bloc.etageId ?? bloc.etage?.id)
      .filter((value): value is string => Boolean(value))
  ).size;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[#3B9AEE] rounded-lg flex items-center justify-center text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Bloc operatoire</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#3B9AEE]">
              <p className="text-gray-600 text-sm font-medium">Blocs</p>
              <p className="text-3xl font-bold text-gray-800">{blocs.length}</p>
            </div>
            <div className="bg-[#E4FFE9] rounded-xl p-4 text-center border-2 border-[#4ADE80]">
              <p className="text-gray-600 text-sm font-medium">Etages</p>
              <p className="text-3xl font-bold text-gray-800">{totalEtages}</p>
            </div>
            <div className="bg-[#FFE4E4] rounded-xl p-4 text-center border-2 border-[#FF6B6B]">
              <p className="text-gray-600 text-sm font-medium">Salles</p>
              <p className="text-3xl font-bold text-gray-800">{totalSalles}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un bloc par nom ou localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                setEditingBloc(null);
                setShowModal(true);
              }}
              className="flex items-center justify-center space-x-2 bg-[#4ADE80] text-white px-4 py-2 rounded-lg hover:bg-[#3ACC70] transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau bloc</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B9AEE]"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : filteredBlocs.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              {searchTerm ? 'Aucun bloc trouve' : 'Aucun bloc cree. Creez votre premier bloc.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#3B9AEE] to-[#60A5FA]">
                  <th className="px-6 py-3 text-left text-white font-semibold text-sm">Nom</th>
                  <th className="px-6 py-3 text-left text-white font-semibold text-sm">Etage</th>
                  <th className="px-6 py-3 text-left text-white font-semibold text-sm">Localisation</th>
                  <th className="px-6 py-3 text-left text-white font-semibold text-sm">Salles</th>
                  <th className="px-6 py-3 text-left text-white font-semibold text-sm">Description</th>
                  <th className="px-6 py-3 text-right text-white font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocs.map((bloc) => (
                  <tr key={bloc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 text-[#3B9AEE] mr-2" />
                        <div className="text-sm font-medium text-gray-900">{bloc.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bloc.etage ? (
                          <span>
                            {bloc.etage.name}
                            {bloc.etage.floorNumber !== undefined && bloc.etage.floorNumber !== null && (
                              <span className="text-gray-500 ml-1">(Etage {bloc.etage.floorNumber})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bloc.location || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bloc.salles && bloc.salles.length > 0 ? (
                          <span className="font-medium">{bloc.salles.length} salle{bloc.salles.length > 1 ? 's' : ''}</span>
                        ) : (
                          <span className="text-gray-400">Aucune salle</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {bloc.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingBloc(bloc);
                            setShowModal(true);
                          }}
                          className="text-[#3B9AEE] hover:text-[#2D8AD8]"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(bloc.id)}
                          className="text-[#FF6B6B] hover:text-[#FF5252]"
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
        )}
      </div>

      {showModal && (
        <BlocModal
          bloc={editingBloc}
          onClose={() => {
            setShowModal(false);
            setEditingBloc(null);
          }}
          onSuccess={() => {
            fetchBlocs();
            setShowModal(false);
            setEditingBloc(null);
          }}
        />
      )}
    </div>
  );
}

function BlocModal({
  bloc,
  onClose,
  onSuccess,
}: {
  bloc: Bloc | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [etages, setEtages] = useState<Etage[]>([]);
  const [formData, setFormData] = useState({
    name: bloc?.name || '',
    description: bloc?.description || '',
    location: bloc?.location || '',
    etageId: bloc?.etageId || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEtages = async () => {
      try {
        const data = await etageService.getAll();
        setEtages(data);
      } catch (error) {
        console.error('Error fetching etages:', error);
      }
    };
    fetchEtages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Le nom du bloc est requis');
      return;
    }

    if (!formData.etageId) {
      alert('L etage est requis');
      return;
    }

    setLoading(true);
    try {
      const blocData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        etageId: formData.etageId,
      };

      if (bloc) {
        await blocService.update(bloc.id, blocData);
        alert('Bloc modifie avec succes !');
      } else {
        const createdBloc = await blocService.create(blocData);
        console.log('Bloc cree avec succes:', createdBloc);
        alert('Bloc cree avec succes !');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving bloc:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de la sauvegarde du bloc';
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
            {bloc ? 'Modifier le bloc' : 'Nouveau bloc'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {bloc ? 'Modifiez les informations du bloc' : 'Creez un nouveau bloc pour votre clinique'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etage *
            </label>
            <select
              required
              value={formData.etageId}
              onChange={(e) => setFormData({ ...formData, etageId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selectionner un etage</option>
              {etages.map((etage) => (
                <option key={etage.id} value={etage.id}>
                  {etage.name}
                  {etage.floorNumber !== undefined && etage.floorNumber !== null && ` - Etage ${etage.floorNumber}`}
                </option>
              ))}
            </select>
            {etages.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Aucun etage disponible. Veuillez d abord creer un etage.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du bloc *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Bloc A, Bloc Chirurgie, Bloc Urgences..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localisation
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: 1er etage, Aile Est, Batiment principal..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Description du bloc, equipements disponibles, specialites..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

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
              {loading ? 'Enregistrement...' : bloc ? 'Modifier' : 'Creer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
