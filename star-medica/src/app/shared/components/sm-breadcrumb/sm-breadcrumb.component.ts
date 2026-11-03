import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface SmBreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'sm-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sm-breadcrumb.component.html',
  styleUrl: './sm-breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmBreadcrumbComponent {
  readonly items = input.required<readonly SmBreadcrumbItem[]>();
}
