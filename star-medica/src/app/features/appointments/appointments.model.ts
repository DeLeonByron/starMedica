export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'NoShow';

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  reason: string;
  status: AppointmentStatus;
}

export interface AppointmentOption {
  id: number;
  name: string;
}

export interface AppointmentOptions {
  patients: AppointmentOption[];
  doctors: AppointmentOption[];
}

export interface CreateAppointmentRequest {
  patientId: number;
  doctorId: number;
  startsAt: string;
  durationMinutes: number;
  reason: string;
}