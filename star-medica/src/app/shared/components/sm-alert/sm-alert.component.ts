import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'sm-alert',
  standalone: true,
  imports: [],
  templateUrl: './sm-alert.component.html',
  styleUrl: './sm-alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmAlertComponent {
  readonly type = input<'info' | 'success' | 'warning' | 'error'>('info');
  readonly title = input('');
  readonly dismissible = input(false);
  readonly dismissed = output<void>();

  protected dismiss(): void {
    this.dismissed.emit();
  }
}
