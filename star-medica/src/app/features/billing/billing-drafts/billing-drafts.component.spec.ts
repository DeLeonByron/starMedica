import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { BillingDraft, BillingDraftPage } from '../billing.model';
import { BillingService } from '../billing.service';
import { BillingDraftsComponent } from './billing-drafts.component';

describe('BillingDraftsComponent', () => {
  let fixture: ComponentFixture<BillingDraftsComponent>;
  let component: BillingDraftsComponent;
  let billingService: jasmine.SpyObj<BillingService>;

  beforeEach(async () => {
    billingService = jasmine.createSpyObj<BillingService>('BillingService', [
      'getDrafts',
      'createDraft',
      'updateDraft'
    ]);
    billingService.getDrafts.and.callFake((_search, pageNumber, pageSize) =>
      of(emptyPage(pageNumber, pageSize))
    );

    await TestBed.configureTestingModule({
      imports: [BillingDraftsComponent],
      providers: [{ provide: BillingService, useValue: billingService }]
    }).compileComponents();

    fixture = TestBed.createComponent(BillingDraftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the first page with the default page size', () => {
    expect(billingService.getDrafts).toHaveBeenCalledOnceWith('', 1, 20);
    expect(component.pageNumber()).toBe(1);
    expect(component.totalCount()).toBe(0);
    expect(component.isLoading()).toBeFalse();
  });

  it('trims search terms and resets pagination before searching', () => {
    component.pageNumber.set(3);
    component.updateSearchTerm('  consulta  ');
    component.searchDrafts();

    expect(component.appliedSearch()).toBe('consulta');
    expect(component.pageNumber()).toBe(1);
    expect(billingService.getDrafts).toHaveBeenCalledWith('consulta', 1, 20);
  });

  it('ignores late responses and errors from older searches', () => {
    const requests: Subject<BillingDraftPage>[] = [];
    billingService.getDrafts.and.callFake((_search, pageNumber, pageSize) => {
      const request = new Subject<BillingDraftPage>();
      requests.push(request);
      return request;
    });
    component.searchDrafts();
    component.updateSearchTerm('primera búsqueda');
    component.searchDrafts();
    component.updateSearchTerm('búsqueda actual');
    component.searchDrafts();

    const currentDraft = createDraft(31, 'Resultado actual');
    requests[2].next({
      ...emptyPage(1, 20),
      items: [currentDraft],
      totalCount: 1,
      totalPages: 1
    });
    requests[1].next({
      ...emptyPage(1, 20),
      items: [createDraft(30, 'Resultado anterior')],
      totalCount: 1,
      totalPages: 1
    });
    requests[0].error(new Error('Error de búsqueda obsoleta.'));
    fixture.detectChanges();

    expect(component.appliedSearch()).toBe('búsqueda actual');
    expect(component.drafts()).toEqual([currentDraft]);
    expect(component.totalCount()).toBe(1);
    expect(component.error()).toBeNull();
    expect(component.isLoading()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Resultado actual');
    expect(fixture.nativeElement.textContent).not.toContain('Resultado anterior');
    fixture.destroy();
  });

  it('loads a requested page and ignores out-of-range navigation', () => {
    billingService.getDrafts.and.callFake((_search, pageNumber, pageSize) =>
      of({ ...emptyPage(pageNumber, pageSize), totalCount: 45, totalPages: 3 })
    );
    component.searchDrafts();
    component.goToPage(2);
    component.goToPage(4);

    expect(component.pageNumber()).toBe(2);
    expect(billingService.getDrafts).toHaveBeenCalledWith('', 2, 20);
    expect(billingService.getDrafts).toHaveBeenCalledTimes(3);
  });

  it('clears stale page results when loading a new page fails', () => {
    const previousDraft = {
      id: 8,
      customerName: 'Cliente anterior',
      customerNit: null,
      customerAddress: null,
      notes: null,
      total: 125,
      createdAt: '2026-11-02T12:00:00Z',
      lines: []
    };
    billingService.getDrafts.and.returnValues(
      of({
        ...emptyPage(1, 20),
        items: [previousDraft],
        totalCount: 21,
        totalPages: 2
      }),
      throwError(() => new Error('No se pudo cargar la página.'))
    );
    component.searchDrafts();

    component.goToPage(2);
    fixture.detectChanges();

    expect(component.drafts()).toEqual([]);
    expect(component.totalCount()).toBe(0);
    expect(component.totalPages()).toBe(0);
    expect(component.error()).toBe('No se pudo cargar la página.');
    expect(component.isLoading()).toBeFalse();
    expect(fixture.nativeElement.querySelector('sm-empty-state')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('No se pudo cargar la página.');
  });

  it('offers retry after the initial list request fails and only shows empty state after recovery', () => {
    component.error.set('No se pudieron cargar los borradores.');
    billingService.getDrafts.and.returnValue(of(emptyPage(1, 20)));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sm-billing__search')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sm-billing__load-error sm-button')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.sm-billing__empty')).toBeNull();

    fixture.nativeElement.querySelector('.sm-billing__load-error sm-button button').click();
    fixture.detectChanges();

    expect(billingService.getDrafts).toHaveBeenCalledTimes(2);
    expect(component.error()).toBeNull();
    expect(component.isLoading()).toBeFalse();
    expect(fixture.nativeElement.querySelector('.sm-billing__load-error')).toBeNull();
    expect(fixture.nativeElement.querySelector('sm-empty-state')).not.toBeNull();
  });

  it('validates draft lines and prevents adding more than one hundred', () => {
    component.updateCustomerName('Tutor');
    component.updateDescription(0, 'Consulta');
    component.updateUnitPrice(0, 125);

    expect(component.canSubmit()).toBeTrue();

    component.updateQuantity(0, 0);
    expect(component.canSubmit()).toBeFalse();

    component.updateQuantity(0, 1);
    for (let index = 1; index < 100; index++) {
      component.addLine();
    }

    expect(component.form().lines).toHaveSize(100);
    component.addLine();
    expect(component.form().lines).toHaveSize(100);
  });

  it('accepts valid currency decimals despite floating-point representation', () => {
    component.updateCustomerName('Tutor');
    component.updateDescription(0, 'Consulta');
    component.updateQuantity(0, 0.001);
    component.updateUnitPrice(0, 0.29);

    expect(component.canSubmit()).toBeTrue();

    component.updateUnitPrice(0, 0.291);
    expect(component.canSubmit()).toBeFalse();

    component.updateUnitPrice(0, 0.29);
    component.updateQuantity(0, 0.0011);
    expect(component.canSubmit()).toBeFalse();
  });

  it('prevents switching drafts while unsaved edits are active', () => {
    const firstDraft = createDraft(12, 'Cliente inicial');
    const secondDraft = createDraft(13, 'Otro cliente');
    component.drafts.set([firstDraft, secondDraft]);
    component.totalCount.set(2);
    component.totalPages.set(1);
    component.startEditing(firstDraft);
    component.updateCustomerName('Cambios sin guardar');
    fixture.detectChanges();

    const editButtons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.sm-billing__draft-actions button')
    );
    expect(editButtons).toHaveSize(2);
    expect(editButtons.every((button) => button.disabled)).toBeTrue();

    component.startEditing(secondDraft);
    expect(component.editingDraftId()).toBe(firstDraft.id);
    expect(component.form().customerName).toBe('Cambios sin guardar');

    component.cancelEditing();
    component.startEditing(secondDraft);
    expect(component.editingDraftId()).toBe(secondDraft.id);
    expect(component.form().customerName).toBe(secondDraft.customerName);
  });

  it('prevents concurrent edits and preserves the form after an update conflict', () => {
    const draft: BillingDraft = {
      id: 12,
      customerName: 'Cliente original',
      customerNit: '1234567-8',
      customerAddress: 'Zona 1',
      notes: null,
      total: 25,
      createdAt: '2026-11-11T12:00:00Z',
      lines: [{
        lineNumber: 1,
        description: 'Consulta',
        quantity: 1,
        unitPrice: 25,
        lineTotal: 25
      }]
    };
    const updateRequests: Subject<BillingDraft>[] = [];
    billingService.updateDraft.and.callFake(() => {
      const request = new Subject<BillingDraft>();
      updateRequests.push(request);
      return request;
    });
    component.startEditing(draft);
    component.updateCustomerName(' Cliente actualizado ');
    component.updateDescription(0, ' Control ');

    component.saveDraft();
    component.saveDraft();

    expect(billingService.updateDraft).toHaveBeenCalledOnceWith(12, {
      customerName: 'Cliente actualizado',
      customerNit: '1234567-8',
      customerAddress: 'Zona 1',
      notes: null,
      lines: [{ description: 'Control', quantity: 1, unitPrice: 25 }]
    });
    expect(component.isSaving()).toBeTrue();
    expect(component.formError()).toBeNull();

    updateRequests[0].error(new Error('El borrador cambió; vuelve a cargarlo.'));
    fixture.detectChanges();

    expect(component.isSaving()).toBeFalse();
    expect(component.editingDraftId()).toBe(12);
    expect(component.form().customerName).toBe(' Cliente actualizado ');
    expect(component.form().lines[0].description).toBe(' Control ');
    expect(component.formError()).toBe('El borrador cambió; vuelve a cargarlo.');
    expect(component.notice()).toBeNull();

    component.saveDraft();
    expect(billingService.updateDraft).toHaveBeenCalledTimes(2);
    updateRequests[1].next({ ...draft, customerName: 'Cliente actualizado' });
    fixture.detectChanges();

    expect(component.editingDraftId()).toBeNull();
    expect(component.form().customerName).toBe('');
    expect(component.notice()).toBe('Borrador interno #12 actualizado.');
    expect(component.isSaving()).toBeFalse();
  });

  it('locks draft fields and line structure while a save is pending', () => {
    const saveRequest = new Subject<BillingDraft>();
    billingService.createDraft.and.returnValue(saveRequest);
    component.updateCustomerName('Tutor');
    component.updateCustomerNit('1234567-8');
    component.updateCustomerAddress('Zona 1');
    component.updateNotes('Nota');
    component.updateDescription(0, 'Consulta');
    component.updateQuantity(0, 1);
    component.updateUnitPrice(0, 25);
    fixture.detectChanges();

    component.saveDraft();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('form[aria-busy="true"]')).not.toBeNull();
    const inputs: HTMLInputElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.sm-billing__section form sm-input input')
    );
    expect(inputs.length).toBe(6);
    expect(inputs.every((input) => input.disabled)).toBeTrue();
    expect((fixture.nativeElement.querySelector('textarea[name="notes"]') as HTMLTextAreaElement).disabled)
      .toBeTrue();
    const addLineButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.sm-billing__lines-header sm-button button'
    );
    const removeLineButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.sm-billing__line sm-button button'
    );
    expect(addLineButton.disabled).toBeTrue();
    expect(removeLineButton.disabled).toBeTrue();

    component.updateCustomerName('Cambio durante guardado');
    component.updateDescription(0, 'Otro concepto');
    component.updateQuantity(0, 2);
    component.updateUnitPrice(0, 50);
    component.updateNotes('Cambio');
    component.addLine();
    component.removeLine(0);

    expect(component.form()).toEqual({
      customerName: 'Tutor',
      customerNit: '1234567-8',
      customerAddress: 'Zona 1',
      notes: 'Nota',
      lines: [{ description: 'Consulta', quantity: 1, unitPrice: 25 }]
    });

    saveRequest.next({
      ...createDraft(21, 'Tutor'),
      customerNit: '1234567-8',
      customerAddress: 'Zona 1',
      notes: 'Nota'
    });
    fixture.detectChanges();
    expect(component.form().customerName).toBe('');
    expect(component.isSaving()).toBeFalse();
  });
});

function emptyPage(pageNumber: number, pageSize: number): BillingDraftPage {
  return {
    items: [],
    totalCount: 0,
    pageNumber,
    pageSize,
    totalPages: 0
  };
}

function createDraft(id: number, customerName: string): BillingDraft {
  return {
    id,
    customerName,
    customerNit: null,
    customerAddress: null,
    notes: null,
    total: 25,
    createdAt: '2026-11-11T12:00:00Z',
    lines: [{
      lineNumber: 1,
      description: 'Consulta',
      quantity: 1,
      unitPrice: 25,
      lineTotal: 25
    }]
  };
}
