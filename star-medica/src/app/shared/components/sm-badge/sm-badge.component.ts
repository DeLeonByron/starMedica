import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sm-badge',
  standalone: true,
  imports: [],
  templateUrl: './sm-badge.component.html',
  styleUrl: './sm-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmBadgeComponent {
  readonly variant = input<'neutral' | 'success' | 'warning' | 'danger' | 'info'>('neutral');
}
