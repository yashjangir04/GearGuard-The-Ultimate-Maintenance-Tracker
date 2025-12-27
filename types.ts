export enum UserRole {
  Employee = 'Employee',
  Technician = 'Technician',
  Manager = 'Manager'
}

export enum RequestStage {
  New = 'New',
  InProgress = 'In Progress',
  Repaired = 'Repaired',
  Scrap = 'Scrap'
}

export enum RequestType {
  Corrective = 'Corrective',
  Preventive = 'Preventive'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
}

export interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  location: string;
  department?: string;
  assignedEmployeeId?: string;
  maintenanceTeamId: string;
  purchaseDate: string;
  warrantyMonths: number;
  isActive: boolean;
  image?: string;
  health: number;
}

export interface MaintenanceRequest {
  id: string;
  subject: string;
  description: string;
  type: RequestType;
  equipmentId?: string;
  workCenter?: string;
  teamId: string;
  technicianId?: string | null;
  stage: RequestStage;
  scheduledDate?: string;
  durationHours?: number;
  createdAt: string;
  createdBy: string;
  notes?: string;
}

export interface DashboardStats {
  criticalEquipment: number;
  technicianWorkload: number;
  openRequests: number;
  overdueRequests: number;
}