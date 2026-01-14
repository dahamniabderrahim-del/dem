'use client';

import { useEffect, useState } from 'react';
import { stockMovementService } from '@/services/stockMovementService';
import { medicamentService } from '@/services/medicamentService';
import { StockMovement, Medicament } from '@/types';
import { Plus, TrendingUp, TrendingDown, Package, Search, Filter, Calendar } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function StockManagementPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'medecin';
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [medicamentFilter, setMedicamentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [movementsData, medicamentsData] = await Promise.all([
        stockMovementService.getAll(),
        medicamentService.getAll(),
      ]);
      setMovements(movementsData);
      setMedicaments(medicamentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      movement.medicament?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || movement.type === typeFilter;
    const matchesMedicament = medicamentFilter === 'all' || movement.medicamentId === medicamentFilter;
    const matchesDate =
      (!dateFilter.start || new Date(movement.createdAt) >= new Date(dateFilter.start)) &&
      (!dateFilter.end || new Date(movement.createdAt) <= new Date(dateFilter.end));
    return matchesSearch && matchesType && matchesMedicament && matchesDate;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entree':
        return TrendingUp;
      case 'sortie':
      case 'perte':
        return TrendingDown;
      default:
        return Package;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'entree':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sortie':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'perte':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ajustement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'entree':
        return 'Entrée';
      case 'sortie':
        return 'Sortie';
      case 'perte':
        return 'Perte';
      case 'ajustement':
        return 'Ajustement';
      default:
        return type;
    }
  };

  // Statistiques
  const totalEntries = movements.filter(m => m.type === 'entree').reduce((sum, m) => sum + m.quantity, 0);
  const totalExits = movements.filter(m => m.type === 'sortie' || m.type === 'perte').reduce((sum, m) => sum + m.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Gestion du Stock</h1>
          <p className="text-primary-600 mt-2 font-medium">Historique des mouvements de stock</p>
        </div>
        {(isAdmin || isDoctor) && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau mouvement</span>
          </button>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total entrées</p>
              <p className="text-2xl font-bold text-green-900 mt-2">{totalEntries}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total sorties</p>
              <p className="text-2xl font-bold text-red-900 mt-2">{totalExits}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mouvements</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{movements.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tous les types</option>
              <option value="entree">Entrées</option>
              <option value="sortie">Sorties</option>
              <option value="perte">Pertes</option>
              <option value="ajustement">Ajustements</option>
            </select>
          </div>
          <select
            value={medicamentFilter}
            onChange={(e) => setMedicamentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous les médicaments</option>
            {medicaments.map((med) => (
              <option key={med.id} value={med.id}>
                {med.name}
              </option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
              placeholder="Date début"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
              placeholder="Date fin"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des mouvements */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Historique ({filteredMovements.length})
          </h2>
        </div>
        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Médicament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Raison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => {
                  const Icon = getTypeIcon(movement.type);
                  return (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(movement.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {movement.medicament?.name || 'Médicament inconnu'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span
                            className={`px-2 py-1 text-xs rounded border ${getTypeColor(movement.type)}`}
                          >
                            {getTypeLabel(movement.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {movement.type === 'entree' ? '+' : '-'}{movement.quantity} {movement.medicament?.unit || ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {movement.reason || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {movement.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredMovements.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucun mouvement trouvé
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <StockMovementModal
          medicaments={medicaments}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

function StockMovementModal({
  medicaments,
  onClose,
  onSuccess,
}: {
  medicaments: Medicament[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    medicamentId: '',
    type: 'entree' as 'entree' | 'sortie' | 'ajustement' | 'perte',
    quantity: '',
    reason: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await stockMovementService.create({
        ...formData,
        quantity: parseInt(formData.quantity),
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating stock movement:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Nouveau mouvement de stock</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Médicament *
            </label>
            <select
              required
              value={formData.medicamentId}
              onChange={(e) => setFormData({ ...formData, medicamentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sélectionner un médicament</option>
              {medicaments.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name} (Stock: {med.stock} {med.unit || ''})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="entree">Entrée</option>
                <option value="sortie">Sortie</option>
                <option value="perte">Perte</option>
                <option value="ajustement">Ajustement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Ex: Achat, Prescription, Inventaire..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
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
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}













