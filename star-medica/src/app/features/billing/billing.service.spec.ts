import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { BillingDraft, BillingDraftPage } from './billing.model';
import { BillingService } from './billing.service';

describe('BillingService', () => {
  let service: BillingService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BillingService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(BillingService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('creates an internal draft and unwraps the created result', () => {
    const requestBody = {
      customerName: 'Cliente',
      customerNit: null,
      customerAddress: null,
      notes: null,
      lines: [{ description: 'Consulta', quantity: 1, unitPrice: 25 }]
    };
    const createdDraft: BillingDraft = {
      id: 9,
      customerName: 'Cliente',
      customerNit: null,
      customerAddress: null,
      notes: null,
      total: 25,
      createdAt: '2026-11-02T00:00:00Z',
      lines: []
    };
    let response: BillingDraft | undefined;

    service.createDraft(requestBody).subscribe((result) => {
      response = result;
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/billing/drafts`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(requestBody);
    request.flush({ isSuccess: true, value: createdDraft, error: null, statusCode: 201 });

    expect(response).toEqual(createdDraft);
  });

  it('sends search and pagination parameters and unwraps the paged response', () => {
    const page: BillingDraftPage = {
      items: [],
      totalCount: 41,
      pageNumber: 2,
      pageSize: 20,
      totalPages: 3
    };
    let response: BillingDraftPage | undefined;

    service.getDrafts('consulta pediátrica', 2, 20).subscribe((result) => {
      response = result;
    });

    const request = httpTestingController.expectOne((candidate) =>
      candidate.url === `${environment.apiUrl}/billing/drafts`
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('search')).toBe('consulta pediátrica');
    expect(request.request.params.get('pageNumber')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('20');
    request.flush({ isSuccess: true, value: page, error: null, statusCode: 200 });

    expect(response).toEqual(page);
  });

  it('sends draft updates to the resource endpoint and unwraps the result', () => {
    const updatedDraft: BillingDraft = {
      id: 8,
      customerName: 'Cliente',
      customerNit: null,
      customerAddress: null,
      notes: null,
      total: 25,
      createdAt: '2026-11-02T00:00:00Z',
      lines: []
    };
    let response: BillingDraft | undefined;

    service.updateDraft(8, {
      customerName: 'Cliente',
      customerNit: null,
      customerAddress: null,
      notes: null,
      lines: [{ description: 'Consulta', quantity: 1, unitPrice: 25 }]
    }).subscribe((result) => {
      response = result;
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/billing/drafts/8`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.customerName).toBe('Cliente');
    request.flush({ isSuccess: true, value: updatedDraft, error: null, statusCode: 200 });

    expect(response).toEqual(updatedDraft);
  });

  it('surfaces API conflict messages instead of swallowing them', () => {
    let errorMessage: string | undefined;

    service.getDrafts('', 1, 20).subscribe({
      error: (error: unknown) => {
        errorMessage = error instanceof Error ? error.message : undefined;
      }
    });

    const request = httpTestingController.expectOne((candidate) =>
      candidate.url === `${environment.apiUrl}/billing/drafts`
    );
    request.flush(
      { title: 'No se pudo actualizar el borrador.' },
      { status: 409, statusText: 'Conflict' }
    );

    expect(errorMessage).toBe('No se pudo actualizar el borrador.');
  });

  it('surfaces application errors returned in a successful HTTP response', () => {
    let errorMessage: string | undefined;

    service.getDrafts('', 1, 20).subscribe({
      error: (error: unknown) => {
        errorMessage = error instanceof Error ? error.message : undefined;
      }
    });

    const request = httpTestingController.expectOne((candidate) =>
      candidate.url === `${environment.apiUrl}/billing/drafts`
    );
    request.flush({
      isSuccess: false,
      value: null,
      error: 'El tamaño de página no es válido.',
      statusCode: 400
    });

    expect(errorMessage).toBe('El tamaño de página no es válido.');
  });
});
