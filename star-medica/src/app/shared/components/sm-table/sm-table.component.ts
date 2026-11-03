import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sm-table',
  standalone: true,
  imports: [],
  templateUrl: './sm-table.component.html',
  styleUrl: './sm-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmTableComponent {
  readonly ariaLabel = input.required<string>();
  readonly caption = input('');
}
