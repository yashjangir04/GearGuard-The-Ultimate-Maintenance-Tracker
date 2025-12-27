import { useState, useCallback } from "react";
import {
  BarChart3,
  Calendar as CalendarIcon,
  LayoutDashboard,
  PenTool,
  Users,
  Box,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  Wrench,
} from "lucide-react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";

import {
  INITIAL_EQUIPMENT,
  INITIAL_REQUESTS,
  INITIAL_TEAMS,
  INITIAL_TECHNICIANS,
} from "./constants";
import { RequestStage, RequestType, EquipmentStatus } from "./types";

// Pages / Components
import Dashboard from "./components/Dashboard";
import KanbanBoard from "./components/KanbanBoard";
import CalendarView from "./components/CalendarView";
import EquipmentList from "./components/EquipmentList";
import TeamList from "./components/TeamList";
import MaintenanceForm from "./components/MaintenanceForm";
import Reporting from "./components/Reporting";
import Login from "./pages/Login";
import Register from "./pages/Register";

const App = () => {
  const location = useLocation();

  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [teams] = useState(INITIAL_TEAMS);
  const [technicians] = useState(INITIAL_TECHNICIANS);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ---------------- BUSINESS LOGIC ----------------

  const updateRequestStage = useCallback((requestId, newStage) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          if (newStage === RequestStage.SCRAP) {
            setEquipment((eqs) =>
              eqs.map((eq) =>
                eq.id === req.equipmentId
                  ? { ...eq, status: EquipmentStatus.SCRAPPED }
                  : eq
              )
            );
          }

          if (newStage === RequestStage.REPAIRED) {
            setEquipment((eqs) =>
              eqs.map((eq) =>
                eq.id === req.equipmentId
                  ? { ...eq, status: EquipmentStatus.OPERATIONAL }
                  : eq
              )
            );
          }

          if (newStage === RequestStage.IN_PROGRESS) {
            setEquipment((eqs) =>
              eqs.map((eq) =>
                eq.id === req.equipmentId
                  ? { ...eq, status: EquipmentStatus.UNDER_REPAIR }
                  : eq
              )
            );
          }

          return { ...req, stage: newStage };
        }
        return req;
      })
    );
  }, []);

  const addRequest = useCallback((newReq) => {
    const request = {
      ...newReq,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      stage: RequestStage.NEW,
    };
    setRequests((prev) => [request, ...prev]);
    setIsFormOpen(false);
  }, []);

  const openEditForm = (req) => {
    setSelectedRequest(req);
    setIsFormOpen(true);
  };

  // ---------------- NAV CONFIG ----------------

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/maintenance", label: "Maintenance", icon: Wrench },
    { path: "/calendar", label: "Calendar", icon: CalendarIcon },
    { path: "/equipment", label: "Equipment", icon: Box },
    { path: "/teams", label: "Teams", icon: Users },
    { path: "/reporting", label: "Reporting", icon: BarChart3 },
  ];

  const titleMap = {
    "/": "Dashboard",
    "/maintenance": "Maintenance",
    "/calendar": "Calendar",
    "/equipment": "Equipment",
    "/teams": "Teams",
    "/reporting": "Reporting",
  };

  // ---------------- UI ----------------

  return (
    <div className="flex h-screen overflow-hidden text-slate-100 bg-slate-950">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <PenTool size={24} className="text-white" />
          </div>
          {sidebarOpen && (
            <h1 className="text-xl font-bold tracking-tight">GearGuard</h1>
          )}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`
              }
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {sidebarOpen && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* HEADER */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-200">
              {titleMap[location.pathname] || "Dashboard"}
            </h2>

            <div className="hidden md:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <Search size={16} className="text-slate-400" />
              <input
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-48 text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-100 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
            </button>

            <button
              onClick={() => {
                setSelectedRequest(undefined);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <Plus size={18} />
              <span>Create Request</span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <img
                src="https://picsum.photos/seed/admin/100"
                className="w-8 h-8 rounded-full ring-2 ring-indigo-500/20"
                alt="Admin"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-200">
                  Admin User
                </p>
                <p className="text-xs text-slate-500">Fleet Manager</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <Routes>
            <Route
              path="/"
              element={<Dashboard requests={requests} equipment={equipment} />}
            />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route
              path="/maintenance"
              element={
                <KanbanBoard
                  requests={requests}
                  technicians={technicians}
                  equipment={equipment}
                  onUpdateStage={updateRequestStage}
                  onEditRequest={openEditForm}
                />
              }
            />

            <Route
              path="/calendar"
              element={
                <CalendarView
                  requests={requests.filter(
                    (r) => r.type === RequestType.PREVENTIVE
                  )}
                  onDateClick={(date) => {
                    setSelectedRequest({
                      scheduledDate: date.toISOString(),
                      type: RequestType.PREVENTIVE,
                    });
                    setIsFormOpen(true);
                  }}
                />
              }
            />

            <Route
              path="/equipment"
              element={
                <EquipmentList
                  equipment={equipment}
                  requests={requests}
                  onAddMaintenance={(eq) => {
                    setSelectedRequest({
                      equipmentId: eq.id,
                      teamId: eq.teamId,
                      type: RequestType.CORRECTIVE,
                    });
                    setIsFormOpen(true);
                  }}
                />
              }
            />

            <Route
              path="/teams"
              element={<TeamList teams={teams} technicians={technicians} />}
            />

            <Route
              path="/reporting"
              element={
                <Reporting
                  requests={requests}
                  equipment={equipment}
                  teams={teams}
                />
              }
            />
          </Routes>
        </div>
      </main>

      {/* SLIDE-OVER FORM */}
      {isFormOpen && (
        <MaintenanceForm
          request={selectedRequest}
          equipmentList={equipment}
          teams={teams}
          technicians={technicians}
          onClose={() => setIsFormOpen(false)}
          onSubmit={addRequest}
        />
      )}
    </div>
  );
};

export default App;
