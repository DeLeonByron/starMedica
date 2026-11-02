export interface Medicine {
  id: number;
  code: string;
  name: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  stockUnit: string;
  reorderLevel: number;
}

export interface MedicineBatch {
  id: number;
  medicineId: number;
  medicineName: string;
  medicineCode: string;
  batchNumber: string;
  expiresOn: string;
  quantityAvailable: number;
  stockUnit: string;
}

export interface StockMovement {
  id: number;
  medicineName: string;
  batchNumber: string;
  type: 'Received' | 'Dispensed';
  quantity: number;
  occurredAt: string;
  performedByName: string;
  patientId: number | null;
  patientName: string | null;
  consultationId: number | null;
  reference: string | null;
  notes: string | null;
}

export interface PharmacyPatientOption {
  id: number;
  fullName: string;
}

export interface CreateMedicineRequest {
  code: string;
  name: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  stockUnit: string;
  reorderLevel: number;
}

export interface ReceiveStockRequest {
  medicineId: number;
  batchNumber: string;
  expiresOn: string;
  quantity: number;
  reference: string | null;
}

export interface DispenseStockRequest {
  medicineId: number;
  quantity: number;
  patientId: number;
  consultationId: number | null;
  reference: string | null;
}