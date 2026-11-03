import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SmSidebarComponent, SmSidebarItem } from './sm-sidebar.component';

@Component({
  standalone: true,
  imports: [SmSidebarComponent],
  template: `
    <sm-sidebar
      [items]="items"
      [userName]="userName()"
      (logout)="onLogout()"
    />
  `
})
class SmSidebarHostComponent {
  readonly items: readonly SmSidebarItem[] = [
    { label: 'Pacientes', route: '/patients' },
    { label: 'Citas', route: '/appointments' }
  ];
  readonly userName = signal('María Médica');
  readonly logoutCount = signal(0);

  onLogout(): void {
    this.logoutCount.update((count) => count + 1);
  }
}

describe('SmSidebarComponent', () => {
  let fixture: ComponentFixture<SmSidebarHostComponent>;
  let host: SmSidebarHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmSidebarHostComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SmSidebarHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the brand, accessible navigation links and account name', () => {
    const sidebar: HTMLElement = fixture.nativeElement.querySelector('aside');
    const nav: HTMLElement | null = sidebar.querySelector('nav');
    const links: HTMLAnchorElement[] = Array.from(sidebar.querySelectorAll('nav a'));

    expect(sidebar.querySelector('.sm-sidebar__brand')?.textContent).toContain('Star Médica');
    expect(nav?.getAttribute('aria-label')).toBe('Navegación principal');
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Pacientes', 'Citas']);
    expect(links[0].getAttribute('href')).toBe('/patients');
    expect(sidebar.textContent).toContain('María Médica');
  });

  it('emits logout when the account action is activated', () => {
    const logoutButton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    logoutButton.click();

    expect(host.logoutCount()).toBe(1);
  });
});
