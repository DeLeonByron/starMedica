import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { SmBreadcrumbComponent, SmBreadcrumbItem } from './shared/components/sm-breadcrumb/sm-breadcrumb.component';
import { SmSidebarComponent, SmSidebarItem } from './shared/components/sm-sidebar/sm-sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SmBreadcrumbComponent, SmSidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly navigation: readonly SmSidebarItem[] = [
    { label: 'Pacientes', route: '/patients' },
    { label: 'Citas', route: '/appointments' },
    { label: 'Expediente', route: '/consultations' },
    { label: 'Vacunación', route: '/vaccines' },
    { label: 'Farmacia', route: '/pharmacy' },
    { label: 'Borradores', route: '/billing' }
  ];
  protected readonly breadcrumbs = signal<readonly SmBreadcrumbItem[]>([]);

  constructor() {
    this.updateBreadcrumbs(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => this.updateBreadcrumbs(event.urlAfterRedirects));
  }

  protected logout(): void {
    this.auth.logout().subscribe({ error: () => undefined });
  }

  private updateBreadcrumbs(url: string): void {
    const path = url.split(/[?#]/, 1)[0].split('/').filter(Boolean);
    const currentRoute = path[path.length - 1];
    const currentItem = this.navigation.find((item) => item.route.slice(1) === currentRoute);

    if (!currentItem) {
      this.breadcrumbs.set([]);
      return;
    }

    this.breadcrumbs.set(
      currentItem.route === '/patients'
        ? [{ label: currentItem.label }]
        : [{ label: 'Inicio', route: '/patients' }, { label: currentItem.label }]
    );
  }
}
