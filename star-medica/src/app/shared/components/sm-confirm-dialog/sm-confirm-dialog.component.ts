import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { SmButtonComponent } from '../sm-button/sm-button.component';
import { SmModalComponent } from '../sm-modal/sm-modal.component';
import { SmAlertComponent } from '../sm-alert/sm-alert.component';

@Component({
  selector: 'sm-confirm-dialog',
  standalone: true,
  imports: [SmAlertComponent, SmButtonComponent, SmModalComponent],
  templateUrl: './sm-confirm-dialog.component.html',
  styleUrl: './sm-confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmConfirmDialogComponent {
  readonly id = input.required<string>();
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly errorMessage = input<string | null>(null);
  readonly confirmText = input('Confirmar');
  readonly cancelText = input('Cancelar');
  readonly confirmVariant = input<'primary' | 'danger'>('danger');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected confirm(): void {
    if (!this.disabled() && !this.loading()) {
      this.confirmed.emit();
    }
  }

  protected cancel(): void {
    if (!this.loading()) {
      this.cancelled.emit();
    }
  }
}
