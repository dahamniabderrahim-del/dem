'use client';

import { useEffect, useState } from 'react';
import { billingService } from '@/services/billingService';
import { patientService } from '@/services/patientService';
import { Invoice, Patient } from '@/types';
import { Plus, CreditCard, Search, Download, Trash2, Edit, LayoutGrid, History, DollarSign, Receipt } from 'lucide-react';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'interface' | 'historique'>('interface');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await billingService.getAll();
      setInvoices(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous supprimer cette facture ?')) {
      try {
        await billingService.delete(id);
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  // Filtrer
  const filteredInvoices = invoices.filter(inv => {
    const patientName = `${inv.patient?.firstName || ''} ${inv.patient?.lastName || ''}`.toLowerCase();
    return patientName.includes(searchTerm.toLowerCase()) || inv.invoiceNumber?.includes(searchTerm);
  });

  // Stats
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;
  const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
  const totalAmount = invoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + (i.totalAmount || 0), 0);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Tabs */}
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => { setActiveTab('interface'); setCurrentPage(1); }} className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'interface' ? 'bg-[#3B9AEE] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          <LayoutGrid className="w-4 h-4" />
          <span>Interface</span>
        </button>
        <button onClick={() => { setActiveTab('historique'); setCurrentPage(1); }} className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'historique' ? 'bg-[#3B9AEE] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          <History className="w-4 h-4" />
          <span>Historique</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[#FBBF24] rounded-lg flex items-center justify-center text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion de la Facturation</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#E0F4FF] rounded-xl p-4 text-center border-2 border-[#3B9AEE]">
              <p className="text-gray-600 text-sm font-medium">Total Factures</p>
              <p className="text-3xl font-bold text-gray-800">{totalInvoices}</p>
            </div>
            <div className="bg-[#E4FFE9] rounded-xl p-4 text-center border-2 border-[#4ADE80]">
              <p className="text-gray-600 text-sm font-medium">Payées</p>
              <p className="text-3xl font-bold text-gray-800">{paidInvoices}</p>
            </div>
            <div className="bg-[#FFF8E0] rounded-xl p-4 text-center border-2 border-[#FBBF24]">
              <p className="text-gray-600 text-sm font-medium">En attente</p>
              <p className="text-3xl font-bold text-gray-800">{pendingInvoices}</p>
            </div>
            <div className="bg-[#F3E8FF] rounded-xl p-4 text-center border-2 border-[#A855F7]">
              <p className="text-gray-600 text-sm font-medium">Total Encaissé</p>
              <p className="text-2xl font-bold text-gray-800">{paidAmount.toLocaleString()} DA</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-[#3B9AEE] text-white px-4 py-2 rounded-lg hover:bg-[#2D8AD8] transition-all">
                <Download className="w-4 h-4" />
                <span>Télécharger PDF</span>
              </button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B9AEE] focus:border-transparent" />
              </div>
            </div>
            <button onClick={() => { setEditingInvoice(null); setShowModal(true); }} className="flex items-center space-x-2 bg-[#4ADE80] text-white px-4 py-2 rounded-lg hover:bg-[#3ACC70] transition-all">
              <Plus className="w-4 h-4" />
              <span>Nouvelle Facture</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#3B9AEE] to-[#60A5FA]">
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">#</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">N° Facture</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Patient</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Date</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Montant</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Statut</th>
                <th className="px-4 py-3 text-left text-white font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Chargement...</td></tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Aucune facture trouvée</td></tr>
              ) : (
                paginatedInvoices.map((invoice, index) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-3"><span className="font-medium text-[#3B9AEE]">{invoice.invoiceNumber || `FAC-${invoice.id.slice(0, 8)}`}</span></td>
                    <td className="px-4 py-3"><span className="font-medium text-gray-800">{invoice.patient?.firstName} {invoice.patient?.lastName}</span></td>
                    <td className="px-4 py-3 text-gray-600">{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-800">{(invoice.totalAmount || 0).toLocaleString()} DA</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        invoice.status === 'paid' ? 'bg-[#E4FFE9] text-[#4ADE80]' :
                        invoice.status === 'pending' ? 'bg-[#FFF8E0] text-[#FBBF24]' :
                        'bg-[#FFE4E4] text-[#FF6B6B]'
                      }`}>
                        {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Annulée'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-[#A855F7] text-white rounded-lg hover:bg-[#9333EA] transition-all" title="Imprimer">
                          <Receipt className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditingInvoice(invoice); setShowModal(true); }} className="p-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] transition-all" title="Modifier">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(invoice.id)} className="p-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-all" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredInvoices.length)}-{Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} rows</p>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">First</button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
            <span className="px-3 py-1 bg-[#3B9AEE] text-white rounded font-medium">{currentPage}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Last</button>
          </div>
        </div>
      </div>

      {showModal && <InvoiceModal invoice={editingInvoice} onClose={() => { setShowModal(false); setEditingInvoice(null); }} onSuccess={fetchInvoices} />}
    </div>
  );
}

function InvoiceModal({ invoice, onClose, onSuccess }: { invoice: Invoice | null; onClose: () => void; onSuccess: () => void; }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    patientId: invoice?.patientId || '',
    items: invoice?.items || [{ description: '', quantity: 1, unitPrice: 0 }],
    status: invoice?.status || 'pending',
    notes: invoice?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    patientService.getAll().then(setPatients);
  }, []);

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }] });
  };

  const removeItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, items: updated });
  };

  const totalAmount = formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...formData, totalAmount };
      if (invoice) {
        await billingService.update(invoice.id, data);
      } else {
        await billingService.create(data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#3B9AEE] to-[#60A5FA]">
          <h2 className="text-2xl font-bold text-white">{invoice ? 'Modifier' : 'Nouvelle'} facture</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
              <select required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]">
                <option value="">Sélectionner</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]">
                <option value="pending">En attente</option>
                <option value="paid">Payée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Articles</label>
              <button type="button" onClick={addItem} className="text-sm text-[#3B9AEE] hover:underline">+ Ajouter</button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                  <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="number" placeholder="Qté" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <div className="flex items-center space-x-2">
                    <input type="number" placeholder="Prix" min="0" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <span className="text-lg font-bold text-gray-800">Total: {totalAmount.toLocaleString()} DA</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9AEE]" />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#3B9AEE] text-white rounded-lg hover:bg-[#2D8AD8] disabled:opacity-50">{loading ? 'Enregistrement...' : invoice ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
