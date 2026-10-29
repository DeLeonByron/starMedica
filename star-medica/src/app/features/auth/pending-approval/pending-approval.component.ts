import { Component, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  templateUrl: './pending-approval.component.html',
  styleUrl: './pending-approval.component.scss'
})
export class PendingApprovalComponent {
  protected readonly auth = inject(AuthService);

  protected logout(): void {
    this.auth.logout().subscribe({ error: () => undefined });
  }
}