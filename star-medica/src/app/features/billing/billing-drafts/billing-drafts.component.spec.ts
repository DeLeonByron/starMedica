import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { BillingDraftPage } from '../billing.model';
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
    expect(fixture.nativeElement.querySelector('.sm-billing__empty')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('No se pudo cargar la página.');
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
