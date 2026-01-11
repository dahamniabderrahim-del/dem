'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Pill,
  LogOut,
  Stethoscope,
  Building2,
  Scissors,
  Settings,
  ClipboardList,
  CreditCard,
  UserPlus,
  FileSignature,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'medecin', 'receptionniste', 'infirmier'] },
  { href: '/dashboard/patients', label: 'Patients', icon: Users, roles: ['admin', 'medecin', 'receptionniste', 'infirmier'] },
  { href: '/dashboard/consultations', label: 'Visite', icon: Stethoscope, roles: ['admin', 'medecin', 'infirmier'] },
  { href: '/dashboard/appointments', label: 'Rendez-vous', icon: Calendar, roles: ['admin', 'medecin', 'receptionniste'] },
  { href: '/dashboard/blocs', label: "Bloc d'opération", icon: Building2, roles: ['admin', 'medecin'] },
  { href: '/dashboard/operations', label: 'Quarantaine', icon: Scissors, roles: ['admin', 'medecin'] },
  { href: '/dashboard/prescriptions', label: 'Traitement', icon: FileText, roles: ['admin', 'medecin'] },
  { href: '/dashboard/prescription-templates', label: 'Templates Ordonnances', icon: FileSignature, roles: ['admin', 'medecin'] },
  { href: '/dashboard/medical-records', label: 'Dossiers médicaux', icon: ClipboardList, roles: ['admin', 'medecin'] },
  { href: '/dashboard/doctors', label: 'Médecins', icon: UserPlus, roles: ['admin'] },
  { href: '/dashboard/nurses', label: 'Infirmiers', icon: Users, roles: ['admin'] },
  { href: '/dashboard/medicaments', label: 'Pharmacie', icon: Pill, roles: ['admin', 'medecin'] },
  { href: '/dashboard/billing', label: 'Facturation', icon: CreditCard, roles: ['admin'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const filteredItems = menuItems.filter((item) => {
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="w-56 m-4 bg-gradient-to-b from-[#4DA8FF] to-[#3B9AEE] rounded-3xl text-white flex flex-col shadow-xl min-h-[calc(100vh-2rem)]">
      {/* Logo */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold text-white">INITOne</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm',
                isActive
                  ? 'bg-gradient-to-r from-[#FF7B7B] to-[#FF6B6B] text-white shadow-md'
                  : 'text-white/90 hover:bg-white/20'
              )}
            >
              <ItemIcon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-white/90 hover:bg-white/20 transition-all duration-200 w-full text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
