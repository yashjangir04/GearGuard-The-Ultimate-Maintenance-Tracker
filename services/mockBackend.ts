import { User, Team, Equipment, MaintenanceRequest, UserRole, RequestStage, RequestType } from '../types';

const SEED_TEAMS: Team[] = [
  { id: 't1', name: 'Mechanics', members: ['u2'] },
  { id: 't2', name: 'IT Support', members: ['u4'] },
];

const SEED_USERS: User[] = [
  { id: 'u1', name: 'Alice Manager', email: 'manager@gearguard.com', role: UserRole.Manager },
  { id: 'u2', name: 'Bob Tech', email: 'mechanic@gearguard.com', role: UserRole.Technician, teamId: 't1' },
  { id: 'u3', name: 'Charlie Employee', email: 'employee@gearguard.com', role: UserRole.Employee },
  { id: 'u4', name: 'Dave IT', email: 'it@gearguard.com', role: UserRole.Technician, teamId: 't2' },
];

const SEED_EQUIPMENT: Equipment[] = [
  { id: 'e1', name: 'CNC Machine 01', serialNumber: 'CNC-9001', category: 'Heavy Machinery', location: 'Floor A', department: 'Production', maintenanceTeamId: 't1', purchaseDate: '2023-01-10', warrantyMonths: 24, isActive: true, health: 85 },
  { id: 'e2', name: 'Office Printer X1', serialNumber: 'PRT-2022', category: 'Electronics', location: 'Admin Block', department: 'Administration', assignedEmployeeId: 'u3', maintenanceTeamId: 't2', purchaseDate: '2024-02-15', warrantyMonths: 12, isActive: true, health: 95 },
  { id: 'e3', name: 'Forklift MK2', serialNumber: 'FL-550', category: 'Transport', location: 'Warehouse', department: 'Logistics', maintenanceTeamId: 't1', purchaseDate: '2022-05-20', warrantyMonths: 36, isActive: true, health: 25 },
];

const SEED_REQUESTS: MaintenanceRequest[] = [
  { id: 'r1', subject: 'Oil Leak', description: 'Leaking oil from main valve', type: RequestType.Corrective, equipmentId: 'e1', teamId: 't1', stage: RequestStage.New, createdAt: new Date(Date.now() - 86400000).toISOString(), createdBy: 'u3', durationHours: 2 },
  { id: 'r2', subject: 'Paper Jam', description: 'Persistent jam in tray 2', type: RequestType.Corrective, equipmentId: 'e2', teamId: 't2', technicianId: 'u4', stage: RequestStage.InProgress, createdAt: new Date(Date.now() - 172800000).toISOString(), createdBy: 'u3', scheduledDate: new Date().toISOString(), durationHours: 4 },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockBackendService {
  private creds = new Map<string, string>();

  constructor() {
     this.creds.set('manager@gearguard.com', 'demo123');
     this.creds.set('mechanic@gearguard.com', 'demo123');
     this.creds.set('employee@gearguard.com', 'demo123');
     this.creds.set('it@gearguard.com', 'demo123');
  }

  private get<T>(key: string, seed: T): T {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(stored);
  }

  private set(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async login(email: string, password?: string): Promise<User | null> {
    await delay(500);
    
    if (!this.creds.has(email) && password === 'demo123') {
    } else if (this.creds.get(email) !== password) {
        return null; 
    }

    const users = this.get<User[]>('users', SEED_USERS);
    return users.find(u => u.email === email) || null;
  }

  async signup(user: User, password?: string): Promise<User> {
    await delay(500);
    
    const users = this.get<User[]>('users', SEED_USERS);
    
    if (users.find(u => u.email === user.email)) {
        throw new Error("Email already registered.");
    }

    if (!password) throw new Error("Password is required.");
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new Error("Password must be at least 8 characters long and include a lowercase letter, an uppercase letter, and a special character.");
    }

    const newUser = { ...user, id: `u${Date.now()}` };
    users.push(newUser);
    this.set('users', users);
    
    this.creds.set(newUser.email, password);
    
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return this.get<User[]>('users', SEED_USERS);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const users = await this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      this.set('users', users);
    }
  }

  async getTeams(): Promise<Team[]> {
    return this.get<Team[]>('teams', SEED_TEAMS);
  }

  async createTeam(name: string, members: string[]): Promise<Team> {
    const teams = await this.getTeams();
    const newTeam: Team = { id: `t${Date.now()}`, name, members };
    teams.push(newTeam);
    this.set('teams', teams);
    return newTeam;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<void> {
     const teams = await this.getTeams();
     const idx = teams.findIndex(t => t.id === id);
     if (idx !== -1) {
        teams[idx] = { ...teams[idx], ...updates };
        this.set('teams', teams);
     }
  }

  async getEquipment(): Promise<Equipment[]> {
    return this.get<Equipment[]>('equipment', SEED_EQUIPMENT);
  }

  async addEquipment(eq: Omit<Equipment, 'id'>): Promise<Equipment> {
    const equipment = await this.getEquipment();
    const newEq = { ...eq, id: `e${Date.now()}` };
    equipment.push(newEq);
    this.set('equipment', equipment);
    return newEq;
  }

  async updateEquipment(id: string, updates: Partial<Equipment>): Promise<void> {
    const equipment = await this.getEquipment();
    const idx = equipment.findIndex(e => e.id === id);
    if (idx !== -1) {
      equipment[idx] = { ...equipment[idx], ...updates };
      this.set('equipment', equipment);
    }
  }

  async getRequests(): Promise<MaintenanceRequest[]> {
    return this.get<MaintenanceRequest[]>('requests', SEED_REQUESTS);
  }

  async createRequest(req: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'stage'>): Promise<MaintenanceRequest> {
    const requests = await this.getRequests();
    
    let teamIdToUse = req.teamId;
    if (!teamIdToUse && req.equipmentId) {
        const equipment = await this.getEquipment();
        const eq = equipment.find(e => e.id === req.equipmentId);
        if (eq) teamIdToUse = eq.maintenanceTeamId;
    }
    if (!teamIdToUse) {
       const teams = await this.getTeams();
       if (teams.length > 0) teamIdToUse = teams[0].id;
    }

    const newReq: MaintenanceRequest = {
      ...req,
      id: `r${Date.now()}`,
      stage: RequestStage.New,
      createdAt: new Date().toISOString(),
      teamId: teamIdToUse, 
      technicianId: req.technicianId || null,
      durationHours: req.durationHours || 1
    };
    
    requests.push(newReq);
    this.set('requests', requests);
    return newReq;
  }

  async updateRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const requests = await this.getRequests();
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Request not found");

    const oldReq = requests[idx];
    const updatedReq = { ...oldReq, ...updates };

    if (updatedReq.stage === RequestStage.Scrap && oldReq.stage !== RequestStage.Scrap && updatedReq.equipmentId) {
      await this.updateEquipment(updatedReq.equipmentId, { isActive: false });
    }

    requests[idx] = updatedReq;
    this.set('requests', requests);
    return updatedReq;
  }
}

export const mockBackend = new MockBackendService();