import React, { useState, useEffect } from "react";
import { RequestType } from "../types";
import {
  X,
  Calendar,
  Clock,
  Clipboard,
  User,
  Info,
  CheckCircle2,
} from "lucide-react";

const MaintenanceForm = ({
  request,
  equipmentList,
  teams,
  technicians,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    subject: request?.subject || "",
    equipmentId: request?.equipmentId || "",
    type: request?.type || RequestType.CORRECTIVE,
    scheduledDate: request?.scheduledDate
      ? request.scheduledDate.split("T")[0]
      : new Date().toISOString().split("T")[0],
    teamId: request?.teamId || "",
    priority: request?.priority || "medium",
    notes: request?.notes || "",
    category: "",
  });

  // Auto-fill logic
  useEffect(() => {
    if (formData.equipmentId) {
      const eq = equipmentList.find((e) => e.id === formData.equipmentId);
      if (eq) {
        setFormData((prev) => ({
          ...prev,
          teamId: eq.teamId,
          category: eq.category,
        }));
      }
    }
  }, [formData.equipmentId, equipmentList]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm p-4 md:p-0">
      <div className="w-full max-w-2xl h-full bg-slate-900 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600/10 p-2 rounded-xl text-indigo-500">
              <Clipboard size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                {request?.id ? "Edit Request" : "New Maintenance Request"}
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest">
                {request?.id
                  ? `Ticket #${request.id.slice(-6)}`
                  : "Initiate Maintenance Procedure"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Header Progress (Static mockup) */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar">
            {["New", "In Progress", "Repaired", "Scrap"].map((step, idx) => (
              <React.Fragment key={step}>
                <div
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                    request?.stage === step
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {step}
                </div>
                {idx < 3 && <div className="h-px w-8 bg-slate-800"></div>}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Info size={14} className="text-indigo-400" /> Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Printer is jammed, Leaking coolant..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 transition-all"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                Equipment
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
                value={formData.equipmentId}
                onChange={(e) =>
                  setFormData({ ...formData, equipmentId: e.target.value })
                }
              >
                <option value="">Select Asset...</option>
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.serialNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Category
              </label>
              <input
                type="text"
                readOnly
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 cursor-not-allowed"
                value={formData.category || "Auto-filled from Asset"}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Request Type
              </label>
              <div className="flex gap-4 p-1 bg-slate-800 rounded-xl">
                <button
                  onClick={() =>
                    setFormData({ ...formData, type: RequestType.CORRECTIVE })
                  }
                  className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                    formData.type === RequestType.CORRECTIVE
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Breakdown
                </button>
                <button
                  onClick={() =>
                    setFormData({ ...formData, type: RequestType.PREVENTIVE })
                  }
                  className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                    formData.type === RequestType.PREVENTIVE
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Routine Check
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Maintenance Team
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
                value={formData.teamId}
                onChange={(e) =>
                  setFormData({ ...formData, teamId: e.target.value })
                }
              >
                <option value="">Select Team...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} className="text-indigo-400" /> Scheduled
                Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                Priority
              </label>
              <div className="flex gap-2">
                {["low", "medium", "high"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                      formData.priority === p
                        ? p === "high"
                          ? "bg-red-500/20 border-red-500 text-red-500"
                          : p === "medium"
                          ? "bg-amber-500/20 border-amber-500 text-amber-500"
                          : "bg-blue-500/20 border-blue-500 text-blue-500"
                        : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Internal Notes & Instructions
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 resize-none"
                placeholder="Describe the issue or required maintenance steps..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              ></textarea>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-800 bg-slate-900/80 sticky bottom-0 z-10">
          <button
            onClick={() => onSubmit(formData)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
          >
            <CheckCircle2 size={20} />
            <span>Confirm and Schedule Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceForm;
