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
  { path: '**', redirectTo: 'auth/login' }
];
