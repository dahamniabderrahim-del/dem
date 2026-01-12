'use client';

import { useEffect, useState } from 'react';
import { examinationService } from '@/services/examinationService';
import { patientService } from '@/services/patientService';
import { appointmentService } from '@/services/appointmentService';
import { Examination, Patient, Appointment } from '@/types';
import { Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function ExaminationsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'medecin';
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingExamination, setEditingExamination] = useState<Examination | null>(null);

  useEffect(() => {
    fetchExaminations();
  }, []);

  const fetchExaminations = async () => {
    try {
      const data = await examinationService.getAll();
      setExaminations(data);
    } catch (error) {
      console.error('Error fetching examinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExaminations = examinations.filter((exam) => {
    const matchesSearch =
      exam.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesType = !typeFilter || exam.type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'requested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'requested':
        return 'Demandé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      try {
        await examinationService.delete(id);
        fetchExaminations();
      } catch (error: any) {
        console.error('Error deleting examination:', error);
        alert(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleMarkAsCompleted = async (exam: Examination, results: string) => {
    try {
      await examinationService.markAsCompleted(exam.id, results);
      fetchExaminations();
    } catch (error: any) {
      console.error('Error marking examination as completed:', error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Examens Médicaux</h1>
          <p className="text-primary-600 mt-2 font-medium">Gestion des examens et analyses</p>
        </div>
        {(isAdmin || isDoctor) && (
          <button
            onClick={() => {
              setEditingExamination(null);
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvel examen</span>
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par type, patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="requested">Demandé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
            <input
              type="text"
              placeholder="Type d'examen..."
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des examens */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Examens ({filteredExaminations.length})
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
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date demande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Résultats
                  </th>
                  {(isAdmin || isDoctor) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExaminations.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.patient
                        ? `${exam.patient.firstName} ${exam.patient.lastName}`
                        : 'Patient inconnu'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {exam.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(exam.requestedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded border ${getStatusColor(exam.status)}`}
                      >
                        {getStatusLabel(exam.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {exam.results ? (
                        <span className="line-clamp-2">{exam.results}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    {(isAdmin || isDoctor) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {exam.status === 'requested' && (
                            <button
                              onClick={() => {
                                const results = prompt('Entrer les résultats de l\'examen:');
                                if (results) {
                                  handleMarkAsCompleted(exam, results);
                                }
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Marquer comme terminé"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingExamination(exam);
                              setShowModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(exam.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredExaminations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucun examen trouvé
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <ExaminationModal
          examination={editingExamination}
          onClose={() => {
            setShowModal(false);
            setEditingExamination(null);
          }}
          onSuccess={fetchExaminations}
        />
      )}
    </div>
  );
}

function ExaminationModal({
  examination,
  onClose,
  onSuccess,
}: {
  examination: Examination | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [formData, setFormData] = useState({
    patientId: examination?.patientId || '',
    appointmentId: examination?.appointmentId || '',
    type: examination?.type || '',
    description: examination?.description || '',
    requestedDate: examination?.requestedDate
      ? new Date(examination.requestedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: examination?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, appointmentsData] = await Promise.all([
          patientService.getAll(),
          appointmentService.getAll(),
        ]);
        setPatients(patientsData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        requestedDate: new Date(formData.requestedDate),
      };

      if (examination) {
        await examinationService.update(examination.id, {
          ...payload,
          results: examination.results,
          status: examination.status,
        });
      } else {
        await examinationService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving examination:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {examination ? 'Modifier l\'examen' : 'Nouvel examen médical'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient *
            </label>
            <select
              required
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rendez-vous (optionnel)
            </label>
            <select
              value={formData.appointmentId}
              onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Aucun rendez-vous</option>
              {appointments
                .filter(apt => apt.patientId === formData.patientId)
                .map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {formatDate(apt.date)} {apt.time}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'examen *
            </label>
            <input
              type="text"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="Ex: Analyse de sang, ECG, Échographie..."
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de demande *
            </label>
            <input
              type="date"
              required
              value={formData.requestedDate}
              onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
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
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {examination && examination.status === 'requested' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Résultats
              </label>
              <textarea
                defaultValue={examination.results || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    examinationService.update(examination.id, { results: e.target.value });
                  }
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Saisir les résultats de l'examen..."
              />
            </div>
          )}

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
              {loading ? 'Enregistrement...' : examination ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}












