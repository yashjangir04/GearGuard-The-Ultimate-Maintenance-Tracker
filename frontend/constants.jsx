
import { 
  EquipmentStatus, 
  RequestStage, 
  RequestType
} from './types';

export const INITIAL_TEAMS = [
  { id: 't1', name: 'IT Support', members: ['u1', 'u2'] },
  { id: 't2', name: 'Mechanics', members: ['u3'] },
  { id: 't3', name: 'Electricians', members: ['u4'] },
];

export const INITIAL_TECHNICIANS = [
  { id: 'u1', name: 'Aka Foster', avatar: 'https://picsum.photos/seed/u1/100', teamId: 't1' },
  { id: 'u2', name: 'Mitchell Admin', avatar: 'https://picsum.photos/seed/u2/100', teamId: 't1' },
  { id: 'u3', name: 'Jane Doe', avatar: 'https://picsum.photos/seed/u3/100', teamId: 't2' },
  { id: 'u4', name: 'John Smith', avatar: 'https://picsum.photos/seed/u4/100', teamId: 't3' },
];

export const INITIAL_EQUIPMENT = [
  {
    id: 'eq1',
    name: 'Acer Laptop',
    serialNumber: 'LP/203/19281928',
    purchaseDate: '2023-01-15',
    warrantyInfo: '3 Years Comprehensive',
    location: 'Floor 2, Desk 42',
    department: 'Marketing',
    employee: 'John Doe',
    teamId: 't1',
    category: 'Computers',
    status: EquipmentStatus.OPERATIONAL,
    health: 85
  },
  {
    id: 'eq2',
    name: 'CNC Machine X-500',
    serialNumber: 'CNC-500-A22',
    purchaseDate: '2022-06-10',
    warrantyInfo: '5 Years Manufacturer',
    location: 'Production Block B',
    department: 'Production',
    employee: 'Naitik Sherrr',
    teamId: 't2',
    category: 'Machinery',
    status: EquipmentStatus.OPERATIONAL,
    health: 45
  },
  {
    id: 'eq3',
    name: 'Industrial Printer 01',
    serialNumber: 'PRT-999-Z',
    purchaseDate: '2021-12-01',
    warrantyInfo: 'Expired',
    location: 'Admin Office',
    department: 'Administration',
    employee: 'Admin',
    teamId: 't1',
    category: 'Computers',
    status: EquipmentStatus.OPERATIONAL,
    health: 25
  },
];

export const INITIAL_REQUESTS = [
  {
    id: 'req1',
    subject: 'Leaking Oil',
    equipmentId: 'eq2',
    type: RequestType.CORRECTIVE,
    stage: RequestStage.NEW,
    scheduledDate: '2025-01-28T14:30:00',
    duration: 0,
    teamId: 't2',
    priority: 'high',
    createdAt: '2025-01-27T09:00:00',
    notes: 'Oil noticed dripping from the main spindle.'
  },
  {
    id: 'req2',
    subject: 'Routine Software Update',
    equipmentId: 'eq1',
    type: RequestType.PREVENTIVE,
    stage: RequestStage.IN_PROGRESS,
    scheduledDate: '2025-01-30T10:00:00',
    duration: 1.5,
    technicianId: 'u1',
    teamId: 't1',
    priority: 'low',
    createdAt: '2025-01-26T15:00:00',
    notes: 'Checking for OS patches and security updates.'
  }
];

