export interface Vaccine {
  id: number;
  code: string;
  name: string;
  targetDisease: string;
  dosesRequired: number;
  isActive: boolean;
}

export interface PatientVaccination {
  id: number;
  patientId: number;
  patientName: string;
  vaccineId: number;
  vaccineCode: string;
  vaccineName: string;
  doseNumber: number;
  administeredAt: string;
  lotNumber: string;
  expiresOn: string;
  administeredById: number;
  administeredByName: string;
  adverseEventNotes: string | null;
}

export interface CreateVaccineRequest {
  code: string;
  name: string;
  targetDisease: string;
  dosesRequired: number;
}

export interface AdministerVaccineRequest {
  vaccineId: number;
  doseNumber: number;
  administeredAt: string;
  lotNumber: string;
  expiresOn: string;
  adverseEventNotes: string | null;
}