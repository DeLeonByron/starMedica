export interface Consultation {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentId: number | null;
  consultedAt: string;
  chiefComplaint: string;
  presentIllness: string;
  physicalExam: string;
  diagnosisCode: string;
  diagnosisDescription: string;
  treatmentPlan: string;
  notes: string | null;
  weightKg: number | null;
  heightCm: number | null;
  temperatureCelsius: number | null;
  heartRateBpm: number | null;
  respiratoryRatePerMinute: number | null;
  systolicBloodPressure: number | null;
  diastolicBloodPressure: number | null;
  oxygenSaturationPercent: number | null;
}

export interface ConsultationPatient {
  id: number;
  fullName: string;
}

export interface AvailableConsultationAppointment {
  id: number;
  startsAt: string;
  doctorId: number;
  doctorName: string;
  reason: string;
}

export interface CreateConsultationRequest {
  patientId: number;
  appointmentId: number | null;
  consultedAt: string | null;
  chiefComplaint: string;
  presentIllness: string;
  physicalExam: string;
  diagnosisCode: string;
  diagnosisDescription: string;
  treatmentPlan: string;
  notes: string | null;
  weightKg: number | null;
  heightCm: number | null;
  temperatureCelsius: number | null;
  heartRateBpm: number | null;
  respiratoryRatePerMinute: number | null;
  systolicBloodPressure: number | null;
  diastolicBloodPressure: number | null;
  oxygenSaturationPercent: number | null;
}