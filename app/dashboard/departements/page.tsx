'use client';

import { useEffect, useState } from 'react';
import { etageService } from '@/services/etageService';
import { blocService } from '@/services/blocService';
import { salleService } from '@/services/salleService';
import { Etage, Bloc, Salle } from '@/types';
import { Plus, Edit, Trash2, Layers, Building2, DoorOpen, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function DepartementsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const [etages, setEtages] = useState<Etage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEtages, setExpandedEtages] = useState<Set<string>>(new Set());
  const [expandedBlocs, setExpandedBlocs] = useState<Set<string>>(new Set());
  
  // Modals
  const [showEtageModal, setShowEtageModal] = useState(false);
  const [showBlocModal, setShowBlocModal] = useState(false);
  const [showSalleModal, setShowSalleModal] = useState(false);
  const [editingEtage, setEditingEtage] = useState<Etage | null>(null);
  const [editingBloc, setEditingBloc] = useState<Bloc | null>(null);
  const [editingSalle, setEditingSalle] = useState<Salle | null>(null);
  const [selectedBlocForSalle, setSelectedBlocForSalle] = useState<string | null>(null);
  const [selectedEtageForBloc, setSelectedEtageForBloc] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await etageService.getAll();
      setEtages(data || []);
      // Expand all by default
      const etageIds = new Set(data?.map(e => e.id) || []);
      setExpandedEtages(etageIds);
      const blocIds = new Set<string>();
      data?.forEach(etage => {
        etage.blocs?.forEach(bloc => blocIds.add(bloc.id));
      });
      setExpandedBlocs(blocIds);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || 'Erreur lors du chargement des données';
      
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

  const toggleEtage = (etageId: string) => {
    const newExpanded = new Set(expandedEtages);
    if (newExpanded.has(etageId)) {
      newExpanded.delete(etageId);
    } else {
      newExpanded.add(etageId);
    }
    setExpandedEtages(newExpanded);
  };

  const toggleBloc = (blocId: string) => {
    const newExpanded = new Set(expandedBlocs);
    if (newExpanded.has(blocId)) {
      newExpanded.delete(blocId);
    } else {
      newExpanded.add(blocId);
    }
    setExpandedBlocs(newExpanded);
  };

  const handleDeleteEtage = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet étage ? Cette action supprimera également tous les blocs et salles associés.')) {
      return;
    }
    try {
      await etageService.delete(id);
      fetchData();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleDeleteBloc = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bloc ? Cette action supprimera également toutes les salles associées.')) {
      return;
    }
    try {
      await blocService.delete(id);
      fetchData();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleDeleteSalle = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      return;
    }
    try {
      await salleService.delete(id);
      fetchData();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const filteredData = etages.filter(etage => {
    const matchesEtage = etage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (etage.floorNumber !== undefined && etage.floorNumber.toString().includes(searchTerm));
    
    const matchesBloc = etage.blocs?.some(bloc => 
      bloc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bloc.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesSalle = etage.blocs?.some(bloc =>
      bloc.salles?.some(salle => salle.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return matchesEtage || matchesBloc || matchesSalle;
  });

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Structure des Départements</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isAdmin ? 'Gérez la structure hiérarchique de votre clinique' : 'Visualisez la structure de la clinique'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setEditingEtage(null);
                setShowEtageModal(true);
              }}
              className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm hover:shadow font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel étage</span>
            </button>
          </div>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un étage, bloc ou salle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-400 focus:border-primary-300 transition-all bg-gray-50"
          />
        </div>
      </div>

      {/* Structure hiérarchique */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">
            {searchTerm ? 'Aucun résultat trouvé' : 'Aucun étage créé. Commencez par créer votre premier étage.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredData.map((etage) => (
            <div key={etage.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow transition-shadow">
              {/* En-tête de l'étage */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleEtage(etage.id)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {expandedEtages.has(etage.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <Layers className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{etage.name}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {etage.floorNumber !== undefined && etage.floorNumber !== null && `Étage ${etage.floorNumber} • `}
                        {etage.blocs?.length || 0} bloc{etage.blocs?.length !== 1 ? 's' : ''}
                        {etage.description && ` • ${etage.description}`}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingEtage(etage);
                          setShowEtageModal(true);
                        }}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Modifier l'étage"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEtage(etage.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer l'étage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEtageForBloc(etage.id);
                          setSelectedBlocForSalle(null);
                          setEditingBloc(null);
                          setShowBlocModal(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 transition-colors font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Bloc</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Blocs de l'étage */}
              {expandedEtages.has(etage.id) && (
                <div className="p-4 space-y-2 bg-gray-50/50">
                  {etage.blocs && etage.blocs.length > 0 ? (
                    etage.blocs.map((bloc) => (
                      <div key={bloc.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                        {/* En-tête du bloc */}
                        <div className="bg-gray-50 border-b border-gray-100 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <button
                                onClick={() => toggleBloc(bloc.id)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                {expandedBlocs.has(bloc.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <div className="bg-blue-50 p-1.5 rounded-lg">
                                <Building2 className="w-4 h-4 text-blue-500" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800 text-sm">{bloc.name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {bloc.location && `${bloc.location} • `}
                                  {bloc.salles?.length || 0} salle{bloc.salles?.length !== 1 ? 's' : ''}
                                  {bloc.description && ` • ${bloc.description}`}
                                </p>
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => {
                                    setEditingBloc(bloc);
                                    setShowBlocModal(true);
                                  }}
                                  className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                  title="Modifier le bloc"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBloc(bloc.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer le bloc"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBlocForSalle(bloc.id);
                                    setEditingSalle(null);
                                    setShowSalleModal(true);
                                  }}
                                  className="flex items-center space-x-1 px-2.5 py-1 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 transition-colors font-medium"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Salle</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Salles du bloc */}
                        {expandedBlocs.has(bloc.id) && (
                          <div className="p-3 bg-white space-y-1.5">
                            {bloc.salles && bloc.salles.length > 0 ? (
                              bloc.salles.map((salle) => (
                                <div key={salle.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-100/50 transition-all">
                                  <div className="flex items-center space-x-2.5">
                                    <div className="bg-green-50 p-1.5 rounded-lg">
                                      <DoorOpen className="w-3.5 h-3.5 text-green-500" />
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-800">{salle.name}</span>
                                      <div className="flex items-center space-x-2 mt-0.5">
                                        {salle.capacity && (
                                          <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                            {salle.capacity} personnes
                                          </span>
                                        )}
                                        {salle.equipment && (
                                          <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                            {salle.equipment}
                                          </span>
                                        )}
                                        {salle.description && (
                                          <span className="text-xs text-gray-400 italic">{salle.description}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {isAdmin && (
                                    <div className="flex items-center space-x-1">
                                      <button
                                        onClick={() => {
                                          setEditingSalle(salle);
                                          setShowSalleModal(true);
                                        }}
                                        className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                        title="Modifier la salle"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSalle(salle.id)}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="Supprimer la salle"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400 text-center py-2 bg-gray-50 rounded-lg border border-gray-100">Aucune salle dans ce bloc</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                      Aucun bloc dans cet étage
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showEtageModal && isAdmin && (
        <EtageModal
          etage={editingEtage}
          onClose={() => {
            setShowEtageModal(false);
            setEditingEtage(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {showBlocModal && isAdmin && (
        <BlocModal
          bloc={editingBloc}
          defaultEtageId={editingBloc?.etageId || selectedEtageForBloc || undefined}
          onClose={() => {
            setShowBlocModal(false);
            setEditingBloc(null);
            setSelectedEtageForBloc(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {showSalleModal && isAdmin && (
        <SalleModal
          salle={editingSalle}
          blocId={selectedBlocForSalle || editingSalle?.blocId}
          onClose={() => {
            setShowSalleModal(false);
            setEditingSalle(null);
            setSelectedBlocForSalle(null);
          }}
          onSuccess={fetchData}
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
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
      };

      if (etage) {
        await etageService.update(etage.id, data);
      } else {
        await etageService.create(data);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">{etage ? 'Modifier l\'étage' : 'Nouvel étage'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numéro d'étage</label>
            <input
              type="number"
              value={formData.floorNumber}
              onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal pour créer/modifier un bloc
function BlocModal({
  bloc,
  defaultEtageId,
  onClose,
  onSuccess,
}: {
  bloc: Bloc | null;
  defaultEtageId?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [etages, setEtages] = useState<Etage[]>([]);
  const [formData, setFormData] = useState({
    name: bloc?.name || '',
    description: bloc?.description || '',
    location: bloc?.location || '',
    etageId: bloc?.etageId || defaultEtageId || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    etageService.getAll().then(setEtages);
  }, []);

  useEffect(() => {
    if (bloc) {
      setFormData({
        name: bloc.name || '',
        description: bloc.description || '',
        location: bloc.location || '',
        etageId: bloc.etageId || '',
      });
    }
  }, [bloc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.etageId) {
      alert('Le nom et l\'étage sont requis');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        location: formData.location.trim() || null,
        etageId: formData.etageId,
      };

      if (bloc) {
        await blocService.update(bloc.id, data);
      } else {
        await blocService.create(data);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">{bloc ? 'Modifier le bloc' : 'Nouveau bloc'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Étage *</label>
            <select
              required
              value={formData.etageId}
              onChange={(e) => setFormData({ ...formData, etageId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Sélectionner un étage</option>
              {etages.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Localisation</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal pour créer/modifier une salle
function SalleModal({
  salle,
  blocId,
  onClose,
  onSuccess,
}: {
  salle: Salle | null;
  blocId?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [blocs, setBlocs] = useState<Bloc[]>([]);
  const [formData, setFormData] = useState({
    name: salle?.name || '',
    description: salle?.description || '',
    capacity: salle?.capacity?.toString() || '',
    equipment: salle?.equipment || '',
    blocId: salle?.blocId || blocId || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    blocService.getAll().then(setBlocs);
  }, []);

  useEffect(() => {
    if (salle) {
      setFormData({
        name: salle.name || '',
        description: salle.description || '',
        capacity: salle.capacity?.toString() || '',
        equipment: salle.equipment || '',
        blocId: salle.blocId || '',
      });
    }
  }, [salle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.blocId) {
      alert('Le nom et le bloc sont requis');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        equipment: formData.equipment.trim() || null,
        blocId: formData.blocId,
      };

      if (salle) {
        await salleService.update(salle.id, data);
      } else {
        await salleService.create(data);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">{salle ? 'Modifier la salle' : 'Nouvelle salle'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bloc *</label>
            <select
              required
              value={formData.blocId}
              onChange={(e) => setFormData({ ...formData, blocId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={!!blocId}
            >
              <option value="">Sélectionner un bloc</option>
              {blocs.map((b) => (
                <option key={b.id} value={b.id}>{b.name} {b.etage && `- ${b.etage.name}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capacité</label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Équipements</label>
            <input
              type="text"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
