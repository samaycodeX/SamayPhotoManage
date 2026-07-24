import { NavLink, useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { LayoutDashboard, Users, Lock, Settings, LogOut, Camera } from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onFinanceClick, email }) {
  const initial = email?.[0]?.toUpperCase() || 'A';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = async () => {
    await api.post('/auth/logout');
    queryClient.setQueryData('me', null);
    navigate('/login');
  };

  return (
    <aside className="sticky top-0 flex h-screen w-65 shrink-0 flex-col border-r border-border bg-card px-3 py-5">
      <div className="flex items-center gap-2 px-2 pb-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white">
          <Camera size={19} />
        </span>
        <span className="text-base font-semibold text-primary">SamayPhotoManage</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-secondary hover:bg-surface hover:text-primary'
              )
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}

        <button
          onClick={onFinanceClick}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-secondary transition-colors hover:bg-surface hover:text-primary"
        >
          <Lock size={19} />
          Finance
        </button>
      </nav>

      

      <button
        onClick={logout}
        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-md font-medium text-secondary transition-colors hover:bg-surface hover:text-danger"
      >
        <LogOut size={21} />
        Log out
      </button>
    </aside>
  );
}
