import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
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
    data: { roles: ['SuperAdmin', 'Médico', 'Recepcionista'] },
    loadComponent: () =>
      import('./features/patients/patients-list.component').then(
        (component) => component.PatientsListComponent
      )
  },
  {
    path: 'appointments',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin', 'Médico', 'Recepcionista'] },
    loadComponent: () =>
      import('./features/appointments/appointments-list.component').then(
        (component) => component.AppointmentsListComponent
      )
  },
  {
    path: 'consultations',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin', 'Médico'] },
    loadComponent: () =>
      import('./features/consultations/consultations-list.component').then(
        (component) => component.ConsultationsListComponent
      )
  },
  {
    path: 'vaccines',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin', 'Médico', 'Recepcionista'] },
    loadComponent: () =>
      import('./features/vaccines/vaccines-list.component').then(
        (component) => component.VaccinesListComponent
      )
  },
  {
    path: 'pharmacy',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin', 'Farmacéutico'] },
    loadComponent: () =>
      import('./features/pharmacy/pharmacy-list.component').then(
        (component) => component.PharmacyListComponent
      )
  },
  {
    path: 'billing',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin', 'Recepcionista'] },
    loadComponent: () =>
      import('./features/billing/billing-drafts/billing-drafts.component').then(
        (component) => component.BillingDraftsComponent
      )
  },
  { path: '**', redirectTo: 'auth/login' }
];
