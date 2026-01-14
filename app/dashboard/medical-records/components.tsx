'use client';

import { useState } from 'react';
import { allergyService } from '@/services/allergyService';
import { medicalHistoryService } from '@/services/medicalHistoryService';
import { familyHistoryService } from '@/services/familyHistoryService';
import { documentService } from '@/services/documentService';
import { Allergy, MedicalHistory, FamilyHistory, Document } from '@/types';
import { AlertTriangle, Heart, Users as UsersIcon, Plus, Edit, FileText, Upload, X, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

// Composant pour l'onglet Antécédents
export function AntecedentsTab({
  patientId,
  allergies,
  medicalHistories,
  familyHistories,
  onRefresh,
}: {
  patientId: string;
  allergies: Allergy[];
  medicalHistories: MedicalHistory[];
  familyHistories: FamilyHistory[];
  onRefresh: () => void;
}) {
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showFamilyHistoryModal, setShowFamilyHistoryModal] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [editingHistory, setEditingHistory] = useState<MedicalHistory | null>(null);
  const [editingFamilyHistory, setEditingFamilyHistory] = useState<FamilyHistory | null>(null);

  const activeAllergies = allergies.filter(a => a.isActive);
  const activeHistories = medicalHistories.filter(h => h.isActive);

  return (
    <div className="space-y-6">
      {/* Allergies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Allergies ({activeAllergies.length})</span>
          </h3>
          <button
            onClick={() => {
              setEditingAllergy(null);
              setShowAllergyModal(true);
            }}
            className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
        <div className="space-y-2">
          {activeAllergies.length === 0 ? (
            <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">Aucune allergie enregistrée</p>
          ) : (
            activeAllergies.map((allergy) => (
              <div key={allergy.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-red-900">{allergy.name}</span>
                      {allergy.type && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                          {allergy.type}
                        </span>
                      )}
                      {allergy.severity && (
                        <span className="text-xs px-2 py-0.5 bg-red-200 text-red-800 rounded">
                          {allergy.severity}
                        </span>
                      )}
                    </div>
                    {allergy.reaction && (
                      <p className="text-sm text-red-700 mt-1">Réaction: {allergy.reaction}</p>
                    )}
                    {allergy.notes && (
                      <p className="text-xs text-red-600 mt-1">{allergy.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setEditingAllergy(allergy);
                      setShowAllergyModal(true);
                    }}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Antécédents médicaux personnels */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-blue-600" />
            <span>Antécédents médicaux ({activeHistories.length})</span>
          </h3>
          <button
            onClick={() => {
              setEditingHistory(null);
              setShowHistoryModal(true);
            }}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
        <div className="space-y-2">
          {activeHistories.length === 0 ? (
            <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">Aucun antécédent médical enregistré</p>
          ) : (
            activeHistories.map((history) => (
              <div key={history.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-blue-900">{history.condition}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {history.category}
                      </span>
                    </div>
                    {history.description && (
                      <p className="text-sm text-blue-700 mt-1">{history.description}</p>
                    )}
                    {history.startDate && (
                      <p className="text-xs text-blue-600 mt-1">
                        {formatDate(history.startDate)}
                        {history.endDate && ` - ${formatDate(history.endDate)}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setEditingHistory(history);
                      setShowHistoryModal(true);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Antécédents familiaux */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <UsersIcon className="w-5 h-5 text-purple-600" />
            <span>Antécédents familiaux ({familyHistories.length})</span>
          </h3>
          <button
            onClick={() => {
              setEditingFamilyHistory(null);
              setShowFamilyHistoryModal(true);
            }}
            className="flex items-center space-x-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
        <div className="space-y-2">
          {familyHistories.length === 0 ? (
            <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">Aucun antécédent familial enregistré</p>
          ) : (
            familyHistories.map((history) => (
              <div key={history.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-purple-900">{history.relation}</span>
                      <span className="text-sm text-purple-700">-</span>
                      <span className="font-medium text-purple-900">{history.condition}</span>
                    </div>
                    {history.description && (
                      <p className="text-sm text-purple-700 mt-1">{history.description}</p>
                    )}
                    {history.ageAtOnset && (
                      <p className="text-xs text-purple-600 mt-1">Âge au début: {history.ageAtOnset} ans</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setEditingFamilyHistory(history);
                      setShowFamilyHistoryModal(true);
                    }}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals - à implémenter séparément si nécessaire */}
    </div>
  );
}

// Composant pour l'onglet Documents
export function DocumentsTab({
  patientId,
  documents,
  onRefresh,
}: {
  patientId: string;
  documents: Document[];
  onRefresh: () => void;
}) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    category: 'Autre',
    description: '',
    source: 'computer' as 'computer' | 'scanner' | 'phone' | 'echography',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('patientId', patientId);
      formData.append('category', uploadData.category);
      formData.append('description', uploadData.description);
      formData.append('source', uploadData.source);

      await documentService.upload(formData);
      setShowUploadModal(false);
      setUploadData({
        file: null,
        category: 'Autre',
        description: '',
        source: 'computer',
      });
      onRefresh();
      alert('Document uploadé avec succès !');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Erreur lors de l\'upload du document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Documents ({documents.length})
        </h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          <Upload className="w-4 h-4" />
          <span>Importer un document</span>
        </button>
      </div>

      {/* Modal d'upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Importer un document</h3>
              <p className="text-sm text-gray-600 mt-1">
                Importez depuis votre ordinateur, scanner, téléphone ou appareil d'échographie
              </p>
            </div>
            <div className="p-6 space-y-4">
              {/* Source du document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source du document *
                </label>
                <select
                  value={uploadData.source}
                  onChange={(e) => setUploadData({ ...uploadData, source: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="computer">Ordinateur</option>
                  <option value="scanner">Scanner</option>
                  <option value="phone">Téléphone</option>
                  <option value="echography">Appareil d'échographie</option>
                </select>
              </div>

              {/* Sélection de fichier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier *
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.dicom,.dcm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {uploadData.file && (
                  <p className="text-sm text-gray-600 mt-2">
                    Fichier sélectionné : {uploadData.file.name} ({(uploadData.file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Autre">Autre</option>
                  <option value="Radio">Radio</option>
                  <option value="Échographie">Échographie</option>
                  <option value="Analyse">Analyse médicale</option>
                  <option value="Ordonnance">Ordonnance</option>
                  <option value="Bilan">Bilan</option>
                  <option value="Certificat">Certificat</option>
                  <option value="Courrier">Courrier médical</option>
                  <option value="Consultation">Compte-rendu de consultation</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  rows={3}
                  placeholder="Description du document..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Boutons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadData({
                      file: null,
                      category: 'Autre',
                      description: '',
                      source: 'computer',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading || !uploadData.file}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Upload en cours...' : 'Uploader'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucun document</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-gray-900">{doc.name}</span>
                    {doc.category && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                        {doc.category}
                      </span>
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(doc.createdAt)} • {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800"
                    title="Voir"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <button
                    onClick={async () => {
                      if (confirm('Supprimer ce document ?')) {
                        try {
                          await documentService.delete(doc.id);
                          onRefresh();
                        } catch (error) {
                          alert('Erreur lors de la suppression');
                        }
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

