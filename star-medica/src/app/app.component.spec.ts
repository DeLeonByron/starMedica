import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../environments/environment';
import { AuthService } from './core/services/auth.service';
import { AppComponent } from './app.component';

@Component({ standalone: true, template: '' })
class LoginTestComponent {}

describe('AppComponent navigation', () => {
  let fixture: ComponentFixture<AppComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'auth/login', component: LoginTestComponent }])
      ]
    });

    fixture = TestBed.createComponent(AppComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  it('shows only modules allowed to a doctor', () => {
    authenticateWithRoles(['Médico']);

    expect(visibleNavigation()).toEqual([
      '/patients',
      '/appointments',
      '/consultations',
      '/vaccines'
    ]);
  });

  it('shows billing but not clinical or pharmacy modules to a receptionist', () => {
    authenticateWithRoles(['Recepcionista']);

    expect(visibleNavigation()).toEqual([
      '/patients',
      '/appointments',
      '/vaccines',
      '/billing'
    ]);
  });

  it('shows the pharmacy module and uses it as the brand destination for a pharmacist', () => {
    authenticateWithRoles(['Farmacéutico']);

    expect(visibleNavigation()).toEqual(['/pharmacy']);
    const brandLink: HTMLAnchorElement = fixture.nativeElement.querySelector('.sm-sidebar__brand');
    expect(brandLink.getAttribute('href')).toBe('/pharmacy');
  });

  it('shows all existing modules to a SuperAdmin', () => {
    authenticateWithRoles(['SuperAdmin']);

    expect(visibleNavigation()).toEqual([
      '/patients',
      '/appointments',
      '/consultations',
      '/vaccines',
      '/pharmacy',
      '/billing'
    ]);
  });

  it('shows no protected navigation for an account without a recognized role', () => {
    authenticateWithRoles([]);

    expect(fixture.nativeElement.querySelector('sm-sidebar')).toBeNull();
  });

  it('removes protected navigation and announces when logout revocation fails', () => {
    authenticateWithRoles(['Médico']);

    const logoutButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'sm-sidebar button'
    );
    logoutButton.click();
    httpTestingController.expectOne(`${environment.apiUrl}/auth/logout`).flush(
      { title: 'Server unavailable.' },
      { status: 503, statusText: 'Service Unavailable' }
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('sm-sidebar')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('no se pudo confirmar su revocación');
  });

  function authenticateWithRoles(roles: string[]): void {
    TestBed.inject(AuthService).loginWithGoogle('google-id').subscribe();
    httpTestingController.expectOne(`${environment.apiUrl}/auth/google`).flush({
      accessToken: 'access-token',
      expiresAt: '2026-11-06T02:00:00Z',
      user: {
        id: 1,
        fullName: 'Usuario de prueba',
        email: 'usuario@example.com',
        photoUrl: null,
        roles
      }
    });
    fixture.detectChanges();
  }

  function visibleNavigation(): string[] {
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.sm-sidebar__nav a')
    );
    return links.map((link) => link.getAttribute('href') ?? '');
  }
});
