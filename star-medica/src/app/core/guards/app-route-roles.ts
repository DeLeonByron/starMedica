export const APP_ROUTE_ROLES = {
  patients: ['SuperAdmin', 'Médico', 'Recepcionista'],
  appointments: ['SuperAdmin', 'Médico', 'Recepcionista'],
  consultations: ['SuperAdmin', 'Médico'],
  vaccines: ['SuperAdmin', 'Médico', 'Recepcionista'],
  pharmacy: ['SuperAdmin', 'Farmacéutico'],
  billing: ['SuperAdmin', 'Recepcionista']
} as const;
