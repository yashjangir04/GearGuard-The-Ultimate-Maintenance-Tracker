
// Enums converted to objects
export const RequestStage = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  REPAIRED: 'Repaired',
  SCRAP: 'Scrap'
};

export const RequestType = {
  CORRECTIVE: 'Corrective',
  PREVENTIVE: 'Preventive'
};

export const EquipmentStatus = {
  OPERATIONAL: 'Operational',
  UNDER_REPAIR: 'Under Repair',
  SCRAPPED: 'Scrapped'
};

// Type definitions removed - using plain JavaScript objects
// Technician: { id, name, avatar, teamId }
// Team: { id, name, members }
// Equipment: { id, name, serialNumber, purchaseDate, warrantyInfo, location, department, employee, teamId, category, status, health }
// MaintenanceRequest: { id, subject, equipmentId, type, stage, scheduledDate, duration, technicianId?, teamId, priority, createdAt, notes }

