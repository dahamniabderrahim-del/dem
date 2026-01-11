'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, LogOut, Settings, Pill, AlertTriangle, Users, Calendar, FileText, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { notificationService, PrescriptionNotification } from '@/services/notificationService';
import { formatRelativeTime } from '@/lib/prescriptionUtils';
import api from '@/services/api';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [prescriptionNotifications, setPrescriptionNotifications] = useState<{
    expired: PrescriptionNotification[];
    expiringSoon: PrescriptionNotification[];
    total: number;
  }>({ expired: [], expiringSoon: [], total: 0 });
  const [loading, setLoading] = useState(true);

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getPrescriptionNotifications();
        setPrescriptionNotifications(data);
      } catch (error) {
        console.error('Error fetching prescription notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Recherche globale
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length < 2) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await api.get('/search', {
          params: { q: searchTerm },
        });
        setSearchResults(response.data);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error searching:', error);
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fermer les résultats de recherche en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSearchItemClick = (type: string, id: string) => {
    setSearchTerm('');
    setShowSearchResults(false);
    if (type === 'patient') {
      router.push(`/dashboard/patients`);
    } else if (type === 'appointment') {
      router.push(`/dashboard/appointments`);
    } else if (type === 'prescription') {
      router.push(`/dashboard/prescriptions`);
    } else if (type === 'medicament') {
      router.push(`/dashboard/medicaments`);
    }
  };

  // Construire la liste des notifications
  const notifications: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'prescription' | 'appointment' | 'alert';
    severity?: 'error' | 'warning' | 'info';
  }> = [];

  // Ajouter les prescriptions expirées
  prescriptionNotifications.expired.forEach((notif) => {
    notifications.push({
      id: `expired-${notif.id}`,
      title: 'Prescription expirée',
      message: `La prescription de ${notif.patientName} a expiré`,
      time: mounted ? formatRelativeTime(new Date(notif.expirationDate || notif.prescribedDate)) : '',
      type: 'alert',
      severity: 'error',
    });
  });

  // Ajouter les prescriptions qui expirent bientôt
  prescriptionNotifications.expiringSoon.slice(0, 5).forEach((notif) => {
    notifications.push({
      id: `expiring-${notif.id}`,
      title: 'Prescription à renouveler',
      message: `La prescription de ${notif.patientName} expire dans ${notif.daysUntilExpiration} jour${notif.daysUntilExpiration && notif.daysUntilExpiration > 1 ? 's' : ''}`,
      time: mounted ? formatRelativeTime(new Date(notif.expirationDate || notif.prescribedDate)) : '',
      type: 'alert',
      severity: 'warning',
    });
  });

  const totalNotifications = notifications.length;
  const hasSearchResults = searchResults && (
    searchResults.patients?.length > 0 ||
    searchResults.appointments?.length > 0 ||
    searchResults.prescriptions?.length > 0 ||
    searchResults.medicaments?.length > 0
  );

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
      {/* Recherche */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.trim().length >= 2 && setShowSearchResults(true)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setShowSearchResults(false);
                setSearchResults(null);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Résultats de recherche */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 text-center text-gray-500">Recherche en cours...</div>
            ) : hasSearchResults ? (
              <div className="p-2">
                {searchResults.patients?.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Patients</span>
                    </div>
                    {searchResults.patients.map((patient: any) => (
                      <button
                        key={patient.id}
                        onClick={() => handleSearchItemClick('patient', patient.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-2"
                      >
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </p>
                          {patient.phone && (
                            <p className="text-xs text-gray-500">{patient.phone}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.appointments?.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Rendez-vous</span>
                    </div>
                    {searchResults.appointments.map((appointment: any) => (
                      <button
                        key={appointment.id}
                        onClick={() => handleSearchItemClick('appointment', appointment.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-2"
                      >
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.medicaments?.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center space-x-2">
                      <Pill className="w-4 h-4" />
                      <span>Médicaments</span>
                    </div>
                    {searchResults.medicaments.map((medicament: any) => (
                      <button
                        key={medicament.id}
                        onClick={() => handleSearchItemClick('medicament', medicament.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-2"
                      >
                        <Pill className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{medicament.name}</p>
                          {medicament.category && (
                            <p className="text-xs text-gray-500">{medicament.category}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.prescriptions?.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Prescriptions</span>
                    </div>
                    {searchResults.prescriptions.map((prescription: any) => (
                      <button
                        key={prescription.id}
                        onClick={() => handleSearchItemClick('prescription', prescription.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {prescription.patients?.[0]?.patient?.firstName} {prescription.patients?.[0]?.patient?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {prescription.medicaments?.length || 0} médicament(s)
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Aucun résultat trouvé
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Bell className="w-6 h-6" />
            {totalNotifications > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Chargement...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          notification.severity === 'error' ? 'bg-red-50' : ''
                        } ${notification.severity === 'warning' ? 'bg-yellow-50' : ''}`}
                      >
                        <div className="flex items-start space-x-2">
                          {notification.type === 'alert' && (
                            <div className={`mt-0.5 ${
                              notification.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {notification.severity === 'error' ? (
                                <AlertTriangle className="w-4 h-4" />
                              ) : (
                                <Pill className="w-4 h-4" />
                              )}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {prescriptionNotifications.total > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {prescriptionNotifications.expired.length} expirée{prescriptionNotifications.expired.length > 1 ? 's' : ''}
                      </span>
                      <span className="text-gray-600">
                        {prescriptionNotifications.expiringSoon.length} à renouveler
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      router.push('/dashboard/prescriptions');
                    }}
                    className="text-primary-600 text-sm font-medium hover:text-primary-700"
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Menu utilisateur */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {user?.firstName} {user?.lastName}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Naviguer vers profil
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <User className="w-4 h-4" />
                    <span>Mon profil</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Naviguer vers paramètres
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Paramètres</span>
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
