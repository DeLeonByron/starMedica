import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { SmButtonComponent } from '../sm-button/sm-button.component';

@Component({
  selector: 'sm-empty-state',
  standalone: true,
  imports: [SmButtonComponent],
  templateUrl: './sm-empty-state.component.html',
  styleUrl: './sm-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmEmptyStateComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input('');
  readonly actionRequested = output<void>();
}
