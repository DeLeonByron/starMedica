import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SmSidebarItem {
  label: string;
  route: string;
}

@Component({
  selector: 'sm-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sm-sidebar.component.html',
  styleUrl: './sm-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmSidebarComponent {
  readonly brand = input('Star Médica');
  readonly brandLink = input('/');
  readonly items = input.required<readonly SmSidebarItem[]>();
  readonly userName = input('');
  readonly logoutLabel = input('Cerrar sesión');
  readonly logout = output<void>();
}
