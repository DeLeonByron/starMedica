import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { guestGuard } from './guest.guard';

@Component({ standalone: true, template: '' })
class GuestGuardTestComponent {}

describe('guestGuard', () => {
  let httpTestingController: HttpTestingController;

  const authResponse: AuthResponse = {
    accessToken: 'restored-access-token',
    expiresAt: '2026-11-06T02:00:00Z',
    user: {
      id: 1,
      fullName: 'Usuario de prueba',
      email: 'usuario@example.com',
      photoUrl: null,
      roles: ['Médico']
    }
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [GuestGuardTestComponent],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'auth/login', canActivate: [guestGuard], component: GuestGuardTestComponent },
          { path: 'patients', component: GuestGuardTestComponent },
          { path: 'pharmacy', component: GuestGuardTestComponent },
          { path: 'auth/pending-approval', component: GuestGuardTestComponent }
        ])
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  it('redirects an authenticated user away from login to the patients area', async () => {
    const harness = await RouterTestingHarness.create();
    const navigation = harness.navigateByUrl('/auth/login', GuestGuardTestComponent);

    await Promise.resolve();
    httpTestingController.expectOne(`${environment.apiUrl}/auth/refresh`).flush(authResponse);
    await navigation;

    expect(TestBed.inject(Router).url).toBe('/patients');
  });

  it('redirects an authenticated user without roles to pending approval', async () => {
    const harness = await RouterTestingHarness.create();
    const navigation = harness.navigateByUrl('/auth/login', GuestGuardTestComponent);

    await Promise.resolve();
    httpTestingController.expectOne(`${environment.apiUrl}/auth/refresh`).flush({
      ...authResponse,
      user: { ...authResponse.user, roles: [] }
    });
    await navigation;

    expect(TestBed.inject(Router).url).toBe('/auth/pending-approval');
  });

  it('redirects a pharmacist to the pharmacy area instead of the inaccessible patients area', async () => {
    const harness = await RouterTestingHarness.create();
    const navigation = harness.navigateByUrl('/auth/login', GuestGuardTestComponent);

    await Promise.resolve();
    httpTestingController.expectOne(`${environment.apiUrl}/auth/refresh`).flush({
      ...authResponse,
      user: { ...authResponse.user, roles: ['Farmacéutico'] }
    });
    await navigation;

    expect(TestBed.inject(Router).url).toBe('/pharmacy');
  });

  it('keeps the login route when no valid refresh session exists', async () => {
    const harness = await RouterTestingHarness.create();
    const navigation = harness.navigateByUrl('/auth/login', GuestGuardTestComponent);

    await Promise.resolve();
    httpTestingController.expectOne(`${environment.apiUrl}/auth/refresh`).flush(
      { title: 'No hay una sesión activa.' },
      { status: 401, statusText: 'Unauthorized' }
    );
    await navigation;

    expect(TestBed.inject(Router).url).toBe('/auth/login');
    expect(sessionStorage.getItem('sm_access_token')).toBeNull();
  });
});
