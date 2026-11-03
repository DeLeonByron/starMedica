import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sm-card',
  standalone: true,
  templateUrl: './sm-card.component.html',
  styleUrl: './sm-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmCardComponent {
  readonly variant = input<'default' | 'outlined' | 'elevated'>('default');
  readonly padding = input<'none' | 'compact' | 'comfortable'>('comfortable');
  readonly ariaLabel = input('');
}
