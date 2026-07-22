import { Menu, Moon, Sun, LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Props { onMenuClick: () => void; }

export default function Topbar({ onMenuClick }: Props) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden md:block">
          <h2 className="text-sm font-medium text-muted-foreground">
            Welcome back, <span className="text-foreground">{user?.firstName}</span>
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button onClick={() => navigate('/profile')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <User className="h-5 w-5" />
        </button>

        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-secondary transition-colors text-destructive">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
