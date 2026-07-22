import { NavLink } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Stethoscope, CalendarDays, FileText,
  CreditCard, BarChart3, Building2, User, X, Activity
} from 'lucide-react';

interface NavItem { label: string; href: string; icon: React.ElementType; roles?: string[]; }

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Patients', href: '/patients', icon: Users, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  { label: 'Doctors', href: '/doctors', icon: Stethoscope },
  { label: 'Appointments', href: '/appointments', icon: CalendarDays },
  { label: 'Prescriptions', href: '/prescriptions', icon: FileText },
  { label: 'Billing', href: '/billing', icon: CreditCard, roles: ['ADMIN', 'RECEPTIONIST'] },
  { label: 'Reports', href: '/reports', icon: BarChart3, roles: ['ADMIN'] },
  { label: 'Profile', href: '/profile', icon: User },
];

interface Props { open: boolean; onClose: () => void; }

export default function Sidebar({ open, onClose }: Props) {
  const { user } = useAuth();

  const filtered = navItems.filter(item => !item.roles || item.roles.includes(user?.role || ''));

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">MediCare HMS</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
            {user?.firstName[0]}{user?.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filtered.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-white'
                : 'text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground'
            )}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-sidebar-foreground/40 text-center">MediCare HMS v1.0</p>
      </div>
    </aside>
  );
}
