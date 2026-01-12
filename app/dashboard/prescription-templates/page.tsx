'use client';

import { useEffect, useState } from 'react';
import { prescriptionTemplateService } from '@/services/prescriptionTemplateService';
import { PrescriptionTemplate } from '@/types';
import { Plus, Edit, Trash2, Eye, FileText, Palette, Save, X, Copy, Globe, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/utils';

export default function PrescriptionTemplatesPage() {
  const user = useAuthStore((state) => state.user);
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PrescriptionTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<PrescriptionTemplate | null>(null);
  const totalTemplates = templates.length;
  const publicTemplates = templates.filter((template) => template.isPublic).length;
  const privateTemplates = totalTemplates - publicTemplates;

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await prescriptionTemplateService.getAll();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      alert('Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return;
    }

    try {
      await prescriptionTemplateService.delete(id);
      fetchTemplates();
      alert('Template supprimé avec succès');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDuplicate = async (template: PrescriptionTemplate) => {
    try {
      await prescriptionTemplateService.create({
        name: `${template.name} (Copie)`,
        description: template.description,
        content: template.content,
        design: template.design,
        isPublic: false,
      });
      fetchTemplates();
      alert('Template dupliqué avec succès');
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Erreur lors de la duplication');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[#3B9AEE] rounded-lg flex items-center justify-center text-white font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Templates ordonnances</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#3B9AEE]">
              <p className="text-gray-600 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-800">{totalTemplates}</p>
            </div>
            <div className="bg-[#E4FFE9] rounded-xl p-4 text-center border-2 border-[#4ADE80]">
              <p className="text-gray-600 text-sm font-medium">Publics</p>
              <p className="text-3xl font-bold text-gray-800">{publicTemplates}</p>
            </div>
            <div className="bg-[#FFE4E4] rounded-xl p-4 text-center border-2 border-[#FF6B6B]">
              <p className="text-gray-600 text-sm font-medium">Prives</p>
              <p className="text-3xl font-bold text-gray-800">{privateTemplates}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Gere les templates personnalises pour les ordonnances.
            </p>
            {(user?.role === 'admin' || user?.role === 'medecin') && (
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setShowModal(true);
                }}
                className="flex items-center space-x-2 bg-[#4ADE80] text-white px-4 py-2 rounded-lg hover:bg-[#3ACC70] transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Nouveau template</span>
              </button>
            )}
          </div>
          
        </div>
        <div className="p-6">
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">Aucun template disponible</p>
          {(user?.role === 'admin' || user?.role === 'medecin') && (
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setShowModal(true);
              }}
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Créer votre premier template</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    {template.isPublic ? (
                      <Globe className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Créé le {formatDate(template.createdAt)}
                  </p>
                </div>
              </div>

              {template.design && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                    <Palette className="w-3 h-3" />
                    <span>Design personnalisé</span>
                  </div>
                  {template.design && typeof template.design === 'object' && 'primaryColor' in template.design && (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: (template.design as any).primaryColor || '#3b82f6' }}
                      />
                      <span className="text-xs text-gray-600">Couleur principale</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setPreviewTemplate(template);
                    setShowPreview(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  title="Prévisualiser"
                >
                  <Eye className="w-4 h-4" />
                  <span>Prévisualiser</span>
                </button>
                {(user?.role === 'admin' || user?.role === 'medecin') && (
                  <>
                    {(template.createdBy === user?.id || user?.role === 'admin') && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowModal(true);
                          }}
                          className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>

      {showModal && (
        <TemplateEditorModal
          template={selectedTemplate}
          onClose={() => {
            setShowModal(false);
            setSelectedTemplate(null);
          }}
          onSuccess={() => {
            fetchTemplates();
            setShowModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {showPreview && previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => {
            setShowPreview(false);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
}

// Modal d'édition de template
function TemplateEditorModal({
  template,
  onClose,
  onSuccess,
}: {
  template: PrescriptionTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    isPublic: template?.isPublic || false,
    content: template?.content || {
      header: 'ORDONNANCE MÉDICALE',
      showPatientInfo: true,
      showDoctorInfo: true,
      showDate: true,
      showInstructions: true,
    },
    design: template?.design || {
      primaryColor: '#3b82f6',
      secondaryColor: '#60a5fa',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      fontFamily: 'Arial',
      fontSize: 12,
      headerFontSize: 18,
      logoUrl: '',
      showLogo: false,
      logoPosition: 'left',
      borderStyle: 'solid',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 20,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (template) {
        await prescriptionTemplateService.update(template.id, formData);
      } else {
        await prescriptionTemplateService.create(formData);
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving template:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {template ? 'Modifier le template' : 'Nouveau template'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Informations générales
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du template *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Template standard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Description du template..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  Rendre ce template public (visible par tous les médecins)
                </label>
              </div>
            </div>

            {/* Personnalisation du design */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Personnalisation du design</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur principale
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.design.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, primaryColor: e.target.value },
                        })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.design.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, primaryColor: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur secondaire
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.design.secondaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, secondaryColor: e.target.value },
                        })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.design.secondaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, secondaryColor: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur de fond
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.design.backgroundColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, backgroundColor: e.target.value },
                        })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.design.backgroundColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, backgroundColor: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur du texte
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.design.textColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, textColor: e.target.value },
                        })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.design.textColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, textColor: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Police de caractères
                  </label>
                  <select
                    value={formData.design.fontFamily}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        design: { ...formData.design, fontFamily: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier">Courier</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille du texte (px)
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="24"
                    value={formData.design.fontSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        design: { ...formData.design, fontSize: parseInt(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille du titre (px)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="32"
                    value={formData.design.headerFontSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        design: { ...formData.design, headerFontSize: parseInt(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Padding (px)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.design.padding}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        design: { ...formData.design, padding: parseInt(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Logo */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showLogo"
                    checked={formData.design.showLogo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        design: { ...formData.design, showLogo: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="showLogo" className="text-sm font-medium text-gray-700">
                    Afficher un logo
                  </label>
                </div>

                {formData.design.showLogo && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL du logo
                      </label>
                      <input
                        type="text"
                        value={formData.design.logoUrl || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            design: { ...formData.design, logoUrl: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="https://exemple.com/logo.png"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position du logo
                      </label>
                      <select
                        value={formData.design.logoPosition}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            design: { ...formData.design, logoPosition: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="left">Gauche</option>
                        <option value="center">Centre</option>
                        <option value="right">Droite</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Bordure */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style de bordure
                  </label>
                  <select
                    value={formData.design.borderStyle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        design: { ...formData.design, borderStyle: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="none">Aucune</option>
                    <option value="solid">Solide</option>
                    <option value="dashed">Pointillés</option>
                    <option value="dotted">Pointillés ronds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur de bordure
                  </label>
                  <input
                    type="color"
                    value={formData.design.borderColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        design: { ...formData.design, borderColor: e.target.value },
                      })
                    }
                    className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Épaisseur (px)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.design.borderWidth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        design: { ...formData.design, borderWidth: parseInt(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Options de contenu */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Options de contenu
              </h3>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showPatientInfo"
                    checked={formData.content.showPatientInfo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, showPatientInfo: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="showPatientInfo" className="text-sm font-medium text-gray-700">
                    Afficher les informations du patient
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showDoctorInfo"
                    checked={formData.content.showDoctorInfo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, showDoctorInfo: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="showDoctorInfo" className="text-sm font-medium text-gray-700">
                    Afficher les informations du médecin
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showDate"
                    checked={formData.content.showDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, showDate: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="showDate" className="text-sm font-medium text-gray-700">
                    Afficher la date
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showInstructions"
                    checked={formData.content.showInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, showInstructions: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="showInstructions" className="text-sm font-medium text-gray-700">
                    Afficher la section instructions
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  En-tête personnalisé
                </label>
                <input
                  type="text"
                  value={formData.content.header || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      content: { ...formData.content, header: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="ORDONNANCE MÉDICALE"
                />
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
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
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal de prévisualisation
function TemplatePreviewModal({
  template,
  onClose,
}: {
  template: PrescriptionTemplate;
  onClose: () => void;
}) {
  const design = template.design || {};
  const content = template.content || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Prévisualisation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="mx-auto"
            style={{
              maxWidth: '210mm',
              minHeight: '297mm',
              backgroundColor: (design as any).backgroundColor || '#ffffff',
              color: (design as any).textColor || '#111827',
              fontFamily: (design as any).fontFamily || 'Arial',
              fontSize: `${(design as any).fontSize || 12}px`,
              padding: `${(design as any).padding || 20}px`,
              border: `${(design as any).borderWidth || 1}px ${(design as any).borderStyle || 'solid'} ${(design as any).borderColor || '#e5e7eb'}`,
            }}
          >
            {/* En-tête */}
            {(design as any).showLogo && (design as any).logoUrl && (
              <div
                style={{
                  textAlign: (design as any).logoPosition || 'left',
                  marginBottom: '20px',
                }}
              >
                <img
                  src={(design as any).logoUrl}
                  alt="Logo"
                  style={{ maxHeight: '80px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <h1
              style={{
                fontSize: `${(design as any).headerFontSize || 18}px`,
                color: (design as any).primaryColor || '#3b82f6',
                textAlign: 'center',
                marginBottom: '30px',
                fontWeight: 'bold',
              }}
            >
              {content.header || 'ORDONNANCE MÉDICALE'}
            </h1>

            <div style={{ borderTop: `2px solid ${(design as any).primaryColor || '#3b82f6'}`, marginBottom: '20px' }}></div>

            {/* Informations patient */}
            {content.showPatientInfo && (
              <div style={{ marginBottom: '20px' }}>
                <h2
                  style={{
                    color: (design as any).primaryColor || '#3b82f6',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                  }}
                >
                  Patient:
                </h2>
                <p>Nom: Jean DUPONT</p>
                <p>Né(e) le: 01/01/1980</p>
                <p>Sexe: M</p>
              </div>
            )}

            {/* Informations médecin */}
            {content.showDoctorInfo && (
              <div style={{ marginBottom: '20px' }}>
                <h2
                  style={{
                    color: (design as any).primaryColor || '#3b82f6',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                  }}
                >
                  Médecin:
                </h2>
                <p>Dr. Exemple MÉDECIN</p>
              </div>
            )}

            {/* Date */}
            {content.showDate && (
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Date:</strong> {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            )}

            <div style={{ borderTop: `1px solid ${(design as any).borderColor || '#e5e7eb'}`, margin: '20px 0' }}></div>

            {/* Médicaments */}
            <div style={{ marginBottom: '20px' }}>
              <h2
                style={{
                  color: (design as any).primaryColor || '#3b82f6',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                }}
              >
                Médicaments prescrits:
              </h2>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Paracétamol 500mg - 1 comprimé, 3 fois par jour, pendant 7 jours</li>
                <li>Ibuprofène 200mg - 1 comprimé, 2 fois par jour, pendant 5 jours</li>
              </ul>
            </div>

            {/* Instructions */}
            {content.showInstructions && (
              <div style={{ marginTop: '30px' }}>
                <h2
                  style={{
                    color: (design as any).primaryColor || '#3b82f6',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                  }}
                >
                  Instructions:
                </h2>
                <p>Prendre les médicaments après les repas. En cas de doute, consulter votre médecin.</p>
              </div>
            )}

            <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: `1px solid ${(design as any).borderColor || '#e5e7eb'}` }}>
              <p style={{ fontSize: '10px', textAlign: 'center', color: '#6b7280' }}>
                Clinique KARA Oran - Ordonnance médicale
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}













