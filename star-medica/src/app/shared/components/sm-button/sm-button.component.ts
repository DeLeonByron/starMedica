import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sm-button',
  imports: [],
  templateUrl: './sm-button.component.html',
  styleUrl: './sm-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  readonly size = input<'small' | 'medium' | 'large'>('medium');
  readonly disabled = input(false);
  readonly loading = input(false);
}
