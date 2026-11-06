import { Routes } from '@angular/router';

import { APP_ROUTE_ROLES } from './core/guards/app-route-roles';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (component) => component.LoginComponent
      )
  },
  {
    path: 'auth/pending-approval',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/pending-approval/pending-approval.component').then(
        (component) => component.PendingApprovalComponent
      )
  },
  {
    path: 'patients',
    canActivate: [authGuard, roleGuard],
    data: { roles: APP_ROUTE_ROLES.patients },
    loadComponent: () =>
      import('./features/patients/patients-list.component').then(
        (component) => component.PatientsListComponent
      )
  },
  {
    path: 'appointments',
    canActivate: [authGuard, roleGuard],
    data: { roles: APP_ROUTE_ROLES.appointments },
    loadComponent: () =>
      import('./features/appointments/appointments-list.component').then(
        (component) => component.AppointmentsListComponent
      )
  },
  {
    path: 'consultations',
    canActivate: [authGuard, roleGuard],
    data: { roles: APP_ROUTE_ROLES.consultations },
    loadComponent: () =>
      import('./features/consultations/consultations-list.component').then(
        (component) => component.ConsultationsListComponent
      )
  },
  {
    path: 'vaccines',
    canActivate: [authGuard, roleGuard],
    data: { roles: APP_ROUTE_ROLES.vaccines },
    loadComponent: () =>
      import('./features/vaccines/vaccines-list.component').then(
        (component) => component.VaccinesListComponent
      )
  },
  {
    path: 'pharmacy',
    canActivate: [authGuard, roleGuard],
    data: { roles: APP_ROUTE_ROLES.pharmacy },
    loadComponent: () =>
      import('./features/pharmacy/pharmacy-list.component').then(
        (component) => component.PharmacyListComponent
      )
  },
  {
    path: 'billing',
    canActivate: [authGuard, roleGuard],
    data: { roles: APP_ROUTE_ROLES.billing },
    loadComponent: () =>
      import('./features/billing/billing-drafts/billing-drafts.component').then(
        (component) => component.BillingDraftsComponent
      )
  },
  { path: '**', redirectTo: 'auth/login' }
];
