import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { APP_ROUTE_ROLES } from './core/guards/app-route-roles';
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
  private readonly navigationItems: readonly (SmSidebarItem & { roles: readonly string[] })[] = [
    { label: 'Pacientes', route: '/patients', roles: APP_ROUTE_ROLES.patients },
    { label: 'Citas', route: '/appointments', roles: APP_ROUTE_ROLES.appointments },
    { label: 'Expediente', route: '/consultations', roles: APP_ROUTE_ROLES.consultations },
    { label: 'Vacunación', route: '/vaccines', roles: APP_ROUTE_ROLES.vaccines },
    { label: 'Farmacia', route: '/pharmacy', roles: APP_ROUTE_ROLES.pharmacy },
    { label: 'Borradores', route: '/billing', roles: APP_ROUTE_ROLES.billing }
  ];
  protected readonly navigation = computed(() => {
    const userRoles = this.auth.user()?.roles ?? [];
    return this.navigationItems
      .filter((item) => item.roles.some((role) => userRoles.includes(role)))
      .map(({ label, route }) => ({ label, route }));
  });
  protected readonly brandLink = computed(() => this.navigation()[0]?.route ?? '/');
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
    this.auth.logout().subscribe();
  }

  private updateBreadcrumbs(url: string): void {
    const path = url.split(/[?#]/, 1)[0].split('/').filter(Boolean);
    const currentRoute = path[path.length - 1];
    const navigation = this.navigation();
    const currentItem = navigation.find((item) => item.route.slice(1) === currentRoute);

    if (!currentItem) {
      this.breadcrumbs.set([]);
      return;
    }

    this.breadcrumbs.set(
      currentItem.route === navigation[0]?.route
        ? [{ label: currentItem.label }]
        : [
          { label: 'Inicio', route: navigation[0]?.route ?? '/' },
          { label: currentItem.label }
        ]
    );
  }
}
