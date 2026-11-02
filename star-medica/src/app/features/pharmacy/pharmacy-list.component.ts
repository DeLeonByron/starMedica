import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import {
  CreateMedicineRequest,
  DispenseStockRequest,
  Medicine,
  MedicineBatch,
  PharmacyPatientOption,
  ReceiveStockRequest,
  StockMovement
} from './pharmacy.model';
import { PharmacyService } from './pharmacy.service';

@Component({
  selector: 'sm-pharmacy-list',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './pharmacy-list.component.html',
  styleUrl: './pharmacy-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PharmacyListComponent implements OnInit {
  private readonly service = inject(PharmacyService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly medicines = signal<Medicine[]>([]);
  readonly batches = signal<MedicineBatch[]>([]);
  readonly movements = signal<StockMovement[]>([]);
  readonly patients = signal<PharmacyPatientOption[]>([]);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isDispensing = signal(false);
  readonly isMedicineFormOpen = signal(false);
  readonly isReceiptFormOpen = signal(false);
  readonly isDispenseFormOpen = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly isSuperAdmin = computed(() => this.auth.user()?.roles.includes('SuperAdmin') ?? false);
  readonly canManageStock = computed(() => {
    const roles = this.auth.user()?.roles ?? [];
    return roles.includes('SuperAdmin') || roles.includes('Farmacéutico');
  });
  readonly medicineForm: CreateMedicineRequest = {
    code: '', name: '', activeIngredient: '', strength: '', dosageForm: '', stockUnit: 'unidad', reorderLevel: 0
  };
  readonly receiptForm: ReceiveStockRequest = this.emptyReceipt();
  readonly dispenseForm: DispenseStockRequest = this.emptyDispense();

  ngOnInit(): void {
    this.loadDashboard();
  }

  stockForMedicine(medicineId: number): MedicineBatch[] {
    return this.batches().filter((batch) => batch.medicineId === medicineId);
  }

  availableQuantity(medicineId: number): number {
    const today = this.todayInGuatemala();
    return this.stockForMedicine(medicineId)
      .filter((batch) => batch.expiresOn > today)
      .reduce((total, batch) => total + batch.quantityAvailable, 0);
  }

  isBelowReorderLevel(medicine: Medicine): boolean {
    return this.availableQuantity(medicine.id) <= medicine.reorderLevel;
  }

  isExpired(batch: MedicineBatch): boolean {
    return batch.expiresOn <= this.todayInGuatemala();
  }

  openMedicineForm(): void {
    this.formError.set(null);
    this.isMedicineFormOpen.set(true);
  }

  openReceiptForm(medicine?: Medicine): void {
    this.formError.set(null);
    Object.assign(this.receiptForm, this.emptyReceipt());
    this.receiptForm.medicineId = medicine?.id ?? this.medicines()[0]?.id ?? 0;
    this.isReceiptFormOpen.set(true);
  }

  openDispenseForm(medicine?: Medicine): void {
    this.formError.set(null);
    Object.assign(this.dispenseForm, this.emptyDispense());
    this.dispenseForm.medicineId = medicine?.id ?? this.medicines()[0]?.id ?? 0;
    this.dispenseForm.patientId = this.patients()[0]?.id ?? 0;
    this.isDispenseFormOpen.set(true);
  }

  closeForms(): void {
    if (!this.isSaving() && !this.isDispensing()) {
      this.isMedicineFormOpen.set(false);
      this.isReceiptFormOpen.set(false);
      this.isDispenseFormOpen.set(false);
    }
  }

  createMedicine(): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);
    this.formError.set(null);
    const request = {
      ...this.medicineForm,
      code: this.medicineForm.code.trim().toUpperCase(),
      name: this.medicineForm.name.trim(),
      activeIngredient: this.medicineForm.activeIngredient.trim(),
      strength: this.medicineForm.strength.trim(),
      dosageForm: this.medicineForm.dosageForm.trim(),
      stockUnit: this.medicineForm.stockUnit.trim()
    };
    this.service.createMedicine(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isMedicineFormOpen.set(false);
          Object.assign(this.medicineForm, {
            code: '', name: '', activeIngredient: '', strength: '', dosageForm: '', stockUnit: 'unidad', reorderLevel: 0
          });
          this.loadDashboard();
        },
        error: (error: unknown) => {
          this.formError.set(this.errorMessage(error, 'No se pudo guardar el medicamento.'));
          this.isSaving.set(false);
        }
      });
  }

  receiveStock(): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);
    this.formError.set(null);
    const request = { ...this.receiptForm, batchNumber: this.receiptForm.batchNumber.trim(), reference: this.receiptForm.reference?.trim() || null };
    this.service.receiveStock(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isReceiptFormOpen.set(false);
          this.loadDashboard();
        },
        error: (error: unknown) => {
          this.formError.set(this.errorMessage(error, 'No se pudo recibir el lote.'));
          this.isSaving.set(false);
        }
      });
  }

  dispense(): void {
    if (this.isDispensing()) return;
    this.isDispensing.set(true);
    this.formError.set(null);
    const request = { ...this.dispenseForm, reference: this.dispenseForm.reference?.trim() || null };
    this.service.dispense(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDispensing.set(false);
          this.isDispenseFormOpen.set(false);
          this.loadDashboard();
        },
        error: (error: unknown) => {
          this.formError.set(this.errorMessage(error, 'No se pudo dispensar el medicamento.'));
          this.isDispensing.set(false);
        }
      });
  }

  movementTypeLabel(type: StockMovement['type']): string {
    return type === 'Received' ? 'Recepción' : 'Despacho';
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.service.getDashboardData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.medicines.set(data.medicines);
          this.batches.set(data.stock);
          this.movements.set(data.movements);
          this.patients.set(data.patients);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error, 'No se pudo cargar farmacia.'));
          this.isLoading.set(false);
        }
      });
  }

  private todayInGuatemala(): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Guatemala', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values['year']}-${values['month']}-${values['day']}`;
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }

  private emptyReceipt(): ReceiveStockRequest {
    return { medicineId: 0, batchNumber: '', expiresOn: '', quantity: 0, reference: null };
  }

  private emptyDispense(): DispenseStockRequest {
    return { medicineId: 0, quantity: 0, patientId: 0, consultationId: null, reference: null };
  }
}