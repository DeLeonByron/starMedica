import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import {
  Medicine,
  MedicineBatch,
  PharmacyPatientOption,
  StockMovement
} from './pharmacy.model';
import { PharmacyListComponent } from './pharmacy-list.component';
import { PharmacyService } from './pharmacy.service';

interface PharmacyDashboard {
  medicines: Medicine[];
  stock: MedicineBatch[];
  movements: StockMovement[];
  patients: PharmacyPatientOption[];
}

describe('PharmacyListComponent', () => {
  it('prevents duplicate medicine creation and preserves the catalog form after rejection', async () => {
    const createRequests: Subject<Medicine>[] = [];
    const service = jasmine.createSpyObj<PharmacyService>(
      'PharmacyService',
      ['getDashboardData', 'createMedicine']
    );
    service.getDashboardData.and.returnValue(of({
      medicines: [],
      stock: [],
      movements: [],
      patients: []
    }));
    service.createMedicine.and.callFake(() => {
      const request = new Subject<Medicine>();
      createRequests.push(request);
      return request;
    });

    await TestBed.configureTestingModule({
      imports: [PharmacyListComponent],
      providers: [
        { provide: PharmacyService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ id: 9, roles: ['SuperAdmin'] }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PharmacyListComponent);
    fixture.detectChanges();
    fixture.componentInstance.openMedicineForm();
    Object.assign(fixture.componentInstance.medicineForm, {
      code: ' med-009 ',
      name: ' Medicamento ',
      activeIngredient: ' Principio activo ',
      strength: ' 5 mg ',
      dosageForm: ' Tableta ',
      stockUnit: ' unidad ',
      reorderLevel: 1.25
    });

    fixture.componentInstance.createMedicine();
    fixture.componentInstance.createMedicine();
    fixture.detectChanges();

    expect(service.createMedicine).toHaveBeenCalledOnceWith({
      code: 'MED-009',
      name: 'Medicamento',
      activeIngredient: 'Principio activo',
      strength: '5 mg',
      dosageForm: 'Tableta',
      stockUnit: 'unidad',
      reorderLevel: 1.25
    });
    expect(fixture.componentInstance.isSaving()).toBeTrue();

    createRequests[0].error(new Error('El código ya está registrado.'));
    fixture.detectChanges();
    expect(fixture.componentInstance.isSaving()).toBeFalse();
    expect(fixture.componentInstance.isMedicineFormOpen()).toBeTrue();
    expect(fixture.componentInstance.medicineForm.code).toBe(' med-009 ');
    expect(fixture.componentInstance.medicineForm.name).toBe(' Medicamento ');
    expect(fixture.nativeElement.textContent).toContain('El código ya está registrado.');

    fixture.componentInstance.createMedicine();
    expect(service.createMedicine).toHaveBeenCalledTimes(2);
    createRequests[1].next({
      id: 9,
      code: 'MED-009',
      name: 'Medicamento',
      activeIngredient: 'Principio activo',
      strength: '5 mg',
      dosageForm: 'Tableta',
      stockUnit: 'unidad',
      reorderLevel: 1.25
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.isMedicineFormOpen()).toBeFalse();
    expect(fixture.componentInstance.isSaving()).toBeFalse();
    expect(fixture.componentInstance.medicineForm).toEqual({
      code: '',
      name: '',
      activeIngredient: '',
      strength: '',
      dosageForm: '',
      stockUnit: 'unidad',
      reorderLevel: 0
    });
    expect(service.getDashboardData).toHaveBeenCalledTimes(2);
    fixture.destroy();
  });

  it('prevents duplicate receipts and preserves the form after an API rejection', async () => {
    const medicine: Medicine = {
      id: 3,
      code: 'MED-003',
      name: 'Medicamento',
      activeIngredient: 'Principio activo',
      strength: '5 mg',
      dosageForm: 'Jarabe',
      stockUnit: 'frasco',
      reorderLevel: 2
    };
    const receiptRequests: Subject<boolean>[] = [];
    const service = jasmine.createSpyObj<PharmacyService>(
      'PharmacyService',
      ['getDashboardData', 'receiveStock']
    );
    service.getDashboardData.and.returnValue(of({
      medicines: [medicine],
      stock: [],
      movements: [],
      patients: []
    }));
    service.receiveStock.and.callFake(() => {
      const request = new Subject<boolean>();
      receiptRequests.push(request);
      return request;
    });

    await TestBed.configureTestingModule({
      imports: [PharmacyListComponent],
      providers: [
        { provide: PharmacyService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ id: 4, roles: ['Farmacéutico'] }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PharmacyListComponent);
    fixture.detectChanges();
    fixture.componentInstance.openReceiptForm(medicine);
    Object.assign(fixture.componentInstance.receiptForm, {
      batchNumber: '  LOTE-3  ',
      quantity: 12.5,
      expiresOn: '2030-01-01',
      reference: '  FACT-3  '
    });

    fixture.componentInstance.receiveStock();
    fixture.componentInstance.receiveStock();
    fixture.detectChanges();

    expect(service.receiveStock).toHaveBeenCalledOnceWith({
      medicineId: medicine.id,
      batchNumber: 'LOTE-3',
      quantity: 12.5,
      expiresOn: '2030-01-01',
      reference: 'FACT-3'
    });
    expect(fixture.componentInstance.isSaving()).toBeTrue();

    receiptRequests[0].error(new Error('Ese lote ya está registrado para el medicamento.'));
    fixture.detectChanges();
    expect(fixture.componentInstance.isSaving()).toBeFalse();
    expect(fixture.componentInstance.isReceiptFormOpen()).toBeTrue();
    expect(fixture.componentInstance.receiptForm.batchNumber).toBe('  LOTE-3  ');
    expect(fixture.componentInstance.receiptForm.quantity).toBe(12.5);
    expect(fixture.nativeElement.textContent).toContain('Ese lote ya está registrado para el medicamento.');

    fixture.componentInstance.receiveStock();
    expect(service.receiveStock).toHaveBeenCalledTimes(2);
    receiptRequests[1].next(true);
    fixture.detectChanges();

    expect(fixture.componentInstance.isReceiptFormOpen()).toBeFalse();
    expect(fixture.componentInstance.isSaving()).toBeFalse();
    expect(service.getDashboardData).toHaveBeenCalledTimes(2);
    fixture.destroy();
  });

  it('prevents duplicate dispensing and preserves the form after an API rejection', async () => {
    const medicine: Medicine = {
      id: 5,
      code: 'MED-005',
      name: 'Medicamento',
      activeIngredient: 'Principio activo',
      strength: '10 mg',
      dosageForm: 'Tableta',
      stockUnit: 'unidad',
      reorderLevel: 1
    };
    const dispenseRequests: Subject<boolean>[] = [];
    const service = jasmine.createSpyObj<PharmacyService>(
      'PharmacyService',
      ['getDashboardData', 'dispense']
    );
    service.getDashboardData.and.returnValue(of({
      medicines: [medicine],
      stock: [],
      movements: [],
      patients: [{ id: 8, fullName: 'Paciente de prueba' }]
    }));
    service.dispense.and.callFake(() => {
      const request = new Subject<boolean>();
      dispenseRequests.push(request);
      return request;
    });

    await TestBed.configureTestingModule({
      imports: [PharmacyListComponent],
      providers: [
        { provide: PharmacyService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ id: 2, roles: ['Farmacéutico'] }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PharmacyListComponent);
    fixture.detectChanges();
    fixture.componentInstance.openDispenseForm(medicine);
    Object.assign(fixture.componentInstance.dispenseForm, {
      quantity: 1.25,
      patientId: 8,
      reference: '  REF-8  '
    });

    fixture.componentInstance.dispense();
    fixture.componentInstance.dispense();
    fixture.detectChanges();

    expect(service.dispense).toHaveBeenCalledOnceWith({
      medicineId: medicine.id,
      quantity: 1.25,
      patientId: 8,
      consultationId: null,
      reference: 'REF-8'
    });
    expect(fixture.componentInstance.isDispensing()).toBeTrue();

    dispenseRequests[0].error(new Error('No hay suficiente cantidad en lotes vigentes.'));
    fixture.detectChanges();
    expect(fixture.componentInstance.isDispensing()).toBeFalse();
    expect(fixture.componentInstance.isDispenseFormOpen()).toBeTrue();
    expect(fixture.componentInstance.dispenseForm.quantity).toBe(1.25);
    expect(fixture.componentInstance.dispenseForm.patientId).toBe(8);
    expect(fixture.nativeElement.textContent).toContain('No hay suficiente cantidad en lotes vigentes.');

    fixture.componentInstance.dispense();
    expect(service.dispense).toHaveBeenCalledTimes(2);
    dispenseRequests[1].next(true);
    fixture.detectChanges();

    expect(fixture.componentInstance.isDispenseFormOpen()).toBeFalse();
    expect(fixture.componentInstance.isDispensing()).toBeFalse();
    expect(service.getDashboardData).toHaveBeenCalledTimes(2);
    fixture.destroy();
  });

  it('aligns stock form constraints with API limits and Guatemala expiry dates', async () => {
    const service = jasmine.createSpyObj<PharmacyService>(
      'PharmacyService',
      ['getDashboardData']
    );
    service.getDashboardData.and.returnValue(of({
      medicines: [{
        id: 1,
        code: 'MED-001',
        name: 'Medicamento',
        activeIngredient: 'Principio activo',
        strength: '10 mg',
        dosageForm: 'Tableta',
        stockUnit: 'unidad',
        reorderLevel: 0
      }],
      stock: [],
      movements: [],
      patients: []
    }));

    await TestBed.configureTestingModule({
      imports: [PharmacyListComponent],
      providers: [
        { provide: PharmacyService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ id: 1, roles: ['Farmacéutico'] }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PharmacyListComponent);
    fixture.detectChanges();
    fixture.componentInstance.openReceiptForm();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const receiptQuantity: HTMLInputElement = fixture.nativeElement.querySelector('#receipt-quantity input');
    const receiptExpiry: HTMLInputElement = fixture.nativeElement.querySelector('#receipt-expires-on input');
    const receiptBatch: HTMLInputElement = fixture.nativeElement.querySelector('#receipt-batch-number input');
    const receiptSubmit: HTMLButtonElement = fixture.nativeElement.querySelector(
      'sm-modal form button[type="submit"]'
    );

    expect(receiptQuantity.min).toBe('0.001');
    expect(receiptQuantity.max).toBe('1000000');
    expect(receiptQuantity.step).toBe('0.001');
    expect(receiptExpiry.min).toBe(fixture.componentInstance.minimumExpiryDate);
    expect(receiptSubmit.disabled).toBeTrue();

    receiptBatch.value = 'LOTE-1';
    receiptBatch.dispatchEvent(new Event('input'));
    receiptQuantity.value = '0';
    receiptQuantity.dispatchEvent(new Event('input'));
    receiptExpiry.value = fixture.componentInstance.minimumExpiryDate;
    receiptExpiry.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(receiptSubmit.disabled).toBeTrue();

    const dayBeforeMinimum = new Date(
      Date.parse(`${fixture.componentInstance.minimumExpiryDate}T00:00:00Z`) - 86_400_000
    ).toISOString().slice(0, 10);
    receiptQuantity.value = '1.001';
    receiptQuantity.dispatchEvent(new Event('input'));
    receiptExpiry.value = dayBeforeMinimum;
    receiptExpiry.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(receiptSubmit.disabled).toBeTrue();

    receiptExpiry.value = '2030-01-01';
    receiptExpiry.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(receiptSubmit.disabled).toBeFalse();
    fixture.destroy();
  });

  it('distinguishes load failures from empty inventory and offers a safe retry', async () => {
    const requests: Subject<PharmacyDashboard>[] = [];
    const service = jasmine.createSpyObj<PharmacyService>(
      'PharmacyService',
      ['getDashboardData']
    );
    service.getDashboardData.and.callFake(() => {
      const request = new Subject<PharmacyDashboard>();
      requests.push(request);
      return request;
    });

    await TestBed.configureTestingModule({
      imports: [PharmacyListComponent],
      providers: [
        { provide: PharmacyService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ id: 1, roles: ['SuperAdmin'] }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PharmacyListComponent);
    fixture.detectChanges();

    requests[0].error(new Error('No se pudo consultar el inventario.'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudo consultar el inventario.');
    expect(fixture.nativeElement.querySelector('sm-empty-state')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sm-pharmacy__toolbar')).toBeNull();

    fixture.nativeElement.querySelector('.sm-pharmacy__load-error sm-button button').click();
    fixture.detectChanges();
    expect(service.getDashboardData).toHaveBeenCalledTimes(2);

    const medicine: Medicine = {
      id: 1,
      code: 'MED-001',
      name: 'Medicamento vigente',
      activeIngredient: 'Principio activo',
      strength: '10 mg',
      dosageForm: 'Tableta',
      stockUnit: 'unidad',
      reorderLevel: 2
    };
    const batch: MedicineBatch = {
      id: 1,
      medicineId: medicine.id,
      medicineName: medicine.name,
      medicineCode: medicine.code,
      batchNumber: 'LOTE-2030',
      expiresOn: '2030-01-01',
      quantityAvailable: 8,
      stockUnit: medicine.stockUnit
    };
    const movement: StockMovement = {
      id: 1,
      medicineName: medicine.name,
      batchNumber: batch.batchNumber,
      type: 'Received',
      quantity: 8,
      occurredAt: '2026-11-09T12:00:00Z',
      performedByName: 'Farmacéutico',
      patientId: null,
      patientName: null,
      consultationId: null,
      reference: 'REF-001',
      notes: null
    };
    requests[1].next({
      medicines: [medicine],
      stock: [batch],
      movements: [movement],
      patients: []
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(medicine.name);
    expect(fixture.nativeElement.textContent).toContain('Movimientos recientes');

    fixture.componentInstance.retryDashboard();
    fixture.detectChanges();
    expect(fixture.componentInstance.isLoading()).toBeTrue();
    expect(fixture.nativeElement.textContent).not.toContain(medicine.name);

    requests[2].error(new Error('La recarga falló.'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('La recarga falló.');
    expect(fixture.nativeElement.textContent).not.toContain(medicine.name);
    expect(fixture.nativeElement.textContent).not.toContain('Movimientos recientes');
    expect(fixture.nativeElement.querySelector('sm-empty-state')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sm-pharmacy__toolbar')).toBeNull();

    fixture.nativeElement.querySelector('.sm-pharmacy__load-error sm-button button').click();
    fixture.detectChanges();
    requests[3].next({ medicines: [], stock: [], movements: [], patients: [] });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('sm-alert')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No hay medicamentos en el catálogo');
    expect(fixture.nativeElement.textContent).toContain('Aún no hay movimientos de inventario');
    fixture.destroy();
  });
});
