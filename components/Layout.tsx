import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Calendar, 
  LogOut, 
  Menu,
  Box,
  ClipboardList
} from 'lucide-react';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  if (!user) return <Outlet />;

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium transition-colors rounded-lg ${
        isActive(path) 
          ? 'bg-blue-600 text-white' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {sidebarOpen && <span>{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col shadow-xl z-20`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          {sidebarOpen && <div className="flex items-center gap-2 font-bold text-xl text-blue-500"><Wrench /> GearGuard</div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {user.role === UserRole.Manager && (
            <>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-4">Management</div>
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Overview" />
              <NavItem path="/teams" icon={Users} label="Teams" />
            </>
          )}

          {user.role === UserRole.Technician && (
            <>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-4">Workspace</div>
              <NavItem path="/technician-dashboard" icon={LayoutDashboard} label="My Dashboard" />
              <NavItem path="/calendar" icon={Calendar} label="Schedule" />
            </>
          )}

          {user.role === UserRole.Employee && (
            <>
               <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-4">Requests</div>
               <NavItem path="/employee-dashboard" icon={LayoutDashboard} label="My Requests" />
            </>
          )}

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-4">Assets</div>
          <NavItem path="/equipment" icon={Box} label="Equipment" />
          
          {user.role === UserRole.Manager && (
             <NavItem path="/work-centers" icon={ClipboardList} label="Work Centers" />
          )}

        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
              {user.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate text-slate-200">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-2 py-2 text-sm text-red-400 hover:bg-slate-800 rounded transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-950">
        <div className="p-8 max-w-7xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;