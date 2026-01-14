'use client';

import { useEffect, useState } from 'react';
import { radioService } from '@/services/radioService';
import { Radio } from '@/types';
import { Plus, Scan, Search, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function RadiosPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const [radios, setRadios] = useState<Radio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRadio, setEditingRadio] = useState<Radio | null>(null);

  useEffect(() => {
    fetchRadios();
  }, []);

  const fetchRadios = async () => {
    try {
      const data = await radioService.getAll();
      setRadios(data);
    } catch (error) {
      console.error('Error fetching radios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRadios = radios.filter(
    (radio) =>
      radio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      radio.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de radio ?')) {
      try {
        await radioService.delete(id);
        fetchRadios();
      } catch (error: any) {
        console.error('Error deleting radio:', error);
        alert(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Types de Radios</h1>
          <p className="text-primary-600 mt-2 font-medium">Gestion des examens radiologiques</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingRadio(null);
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau type de radio</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un type de radio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRadios.map((radio) => (
                  <tr key={radio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Scan className="w-5 h-5 text-purple-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {radio.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {radio.description || '-'}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingRadio(radio);
                              setShowModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(radio.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRadios.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucun type de radio trouvé
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <RadioModal
          radio={editingRadio}
          onClose={() => {
            setShowModal(false);
            setEditingRadio(null);
          }}
          onSuccess={fetchRadios}
        />
      )}
    </div>
  );
}

function RadioModal({
  radio,
  onClose,
  onSuccess,
}: {
  radio: Radio | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: radio?.name || '',
    description: radio?.description || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (radio) {
        await radioService.update(radio.id, formData);
      } else {
        await radioService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving radio:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {radio ? 'Modifier le type de radio' : 'Nouveau type de radio'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du type de radio *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Radiographie thorax, Scanner, IRM..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Description du type de radio..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 shadow-md hover:shadow-lg transition-all font-medium"
            >
              {loading ? 'Enregistrement...' : radio ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}













