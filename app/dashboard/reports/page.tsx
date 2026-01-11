'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { BarChart3, DollarSign, TrendingUp, FileText, Download } from 'lucide-react';

interface FinancialReport {
  summary: {
    totalInvoiced: number;
    totalPaid: number;
    totalPending: number;
    totalReimbursed: number;
    totalReimbursementsPending: number;
    netRevenue: number;
  };
  byPaymentMethod: Record<string, number>;
  byMonth: Record<string, { invoiced: number; paid: number; pending: number }>;
  invoices: number;
  reimbursements: number;
}

export default function ReportsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionniste';

  if (!isAdmin && !isReceptionist) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Vous n'avez pas accès à cette page.</p>
        </div>
      </div>
    );
  }

  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReport();
  }, [dateFilter]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter.start) params.append('startDate', dateFilter.start);
      if (dateFilter.end) params.append('endDate', dateFilter.end);

      const response = await fetch(`/api/reports/financial?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Rapports Financiers</h1>
          <p className="text-primary-600 mt-2 font-medium">Analyse financière détaillée</p>
        </div>
      </div>

      {/* Filtres de date */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Période:</label>
          <input
            type="date"
            value={dateFilter.start}
            onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-gray-500">à</span>
          <input
            type="date"
            value={dateFilter.end}
            onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={fetchReport}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Actualiser
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : report ? (
        <>
          {/* Résumé */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total facturé</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {report.summary.totalInvoiced.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total payé</p>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    {report.summary.totalPaid.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-2">
                    {report.summary.totalPending.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Remboursé</p>
                  <p className="text-2xl font-bold text-purple-900 mt-2">
                    {report.summary.totalReimbursed.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenu net</p>
                  <p className="text-2xl font-bold text-primary-900 mt-2">
                    {report.summary.netRevenue.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-primary-500 p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Factures</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {report.invoices}
                  </p>
                </div>
                <div className="bg-gray-500 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Par méthode de paiement */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Par méthode de paiement</h2>
            <div className="space-y-2">
              {Object.entries(report.byPaymentMethod).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{method}</span>
                  <span className="text-lg font-bold text-primary-600">{Number(amount).toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </div>

          {/* Par mois */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Évolution mensuelle</h2>
            <div className="space-y-2">
              {Object.entries(report.byMonth)
                .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                .map(([month, data]) => (
                  <div key={month} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{month}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Facturé: </span>
                        <span className="font-medium">{Number(data.invoiced).toFixed(2)} €</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Payé: </span>
                        <span className="font-medium text-green-600">{Number(data.paid).toFixed(2)} €</span>
                      </div>
                      <div>
                        <span className="text-gray-600">En attente: </span>
                        <span className="font-medium text-yellow-600">{Number(data.pending).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">Aucune donnée disponible</div>
      )}
    </div>
  );
}












