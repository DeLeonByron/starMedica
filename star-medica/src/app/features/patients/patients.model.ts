export interface Patient {
  id: number;
  code: string;
  fullName: string;
  dateOfBirth: string | null;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

export interface CreatePatientRequest {
  code: string;
  fullName: string;
  dateOfBirth: string | null;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
}
