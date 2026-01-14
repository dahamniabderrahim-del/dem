'use client';

import { useEffect, useState } from 'react';
import { receptionistService } from '@/services/receptionistService';
import { User } from '@/types';
import { Plus, Mail, Phone, Edit, Trash2, UserCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ReceptionistsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const [receptionists, setReceptionists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReceptionist, setEditingReceptionist] = useState<User | null>(null);

  // Vérifier si l'utilisateur est admin
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Accès non autorisé. Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const fetchReceptionists = async () => {
    try {
      const data = await receptionistService.getAll();
      setReceptionists(data);
    } catch (error) {
      console.error('Error fetching receptionists:', error);
      alert('Erreur lors du chargement des réceptionnistes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, receptionistName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le réceptionniste ${receptionistName} ?`)) {
      try {
        await receptionistService.delete(id);
        fetchReceptionists();
      } catch (error: any) {
        console.error('Error deleting receptionist:', error);
        const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression du réceptionniste';
        alert(errorMessage);
      }
    }
  };

  const handleEdit = async (receptionist: User) => {
    try {
      const fullReceptionist = await receptionistService.getById(receptionist.id);
      setEditingReceptionist(fullReceptionist);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading receptionist:', error);
      alert('Erreur lors du chargement des données du réceptionniste');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réceptionnistes</h1>
          <p className="text-gray-600 mt-2">Gestion du personnel de réception de la clinique</p>
        </div>
        <button
          onClick={() => {
            setEditingReceptionist(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-all shadow-md hover:shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Recruter un réceptionniste</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <div className="p-6">
            {receptionists.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Aucun réceptionniste enregistré</p>
                <p className="text-sm mt-2">Commencez par recruter votre premier réceptionniste</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receptionists.map((receptionist) => (
                  <div
                    key={receptionist.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all bg-white hover:border-primary-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {receptionist.firstName} {receptionist.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">{receptionist.role}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {receptionist.email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{receptionist.email}</span>
                        </div>
                      )}
                      {receptionist.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{receptionist.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-3">
                        Membre depuis le {new Date(receptionist.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(receptionist)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(receptionist.id, `${receptionist.firstName} ${receptionist.lastName}`)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <ReceptionistModal
          receptionist={editingReceptionist}
          onClose={() => {
            setShowModal(false);
            setEditingReceptionist(null);
          }}
          onSuccess={fetchReceptionists}
        />
      )}
    </div>
  );
}

function ReceptionistModal({
  receptionist,
  onClose,
  onSuccess,
}: {
  receptionist: User | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    email: receptionist?.email || '',
    password: '',
    firstName: receptionist?.firstName || '',
    lastName: receptionist?.lastName || '',
    phone: receptionist?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!receptionist && !formData.password) {
      setError('Le mot de passe est requis pour un nouveau réceptionniste');
      return;
    }

    setLoading(true);

    try {
      if (receptionist) {
        // Modification
        const updateData: any = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await receptionistService.update(receptionist.id, updateData);
      } else {
        // Création
        await receptionistService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving receptionist:', error);
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {receptionist ? 'Modifier le réceptionniste' : 'Recruter un nouveau réceptionniste'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe {receptionist ? '' : '*'}
            </label>
            <input
              type="password"
              required={!receptionist}
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder={receptionist ? 'Laisser vide pour ne pas modifier' : 'Minimum 6 caractères'}
            />
            {receptionist && (
              <p className="text-xs text-gray-500 mt-1">
                Laisser vide pour conserver le mot de passe actuel
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              {loading ? 'Enregistrement...' : receptionist ? 'Modifier' : 'Recruter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}













