import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SmBreadcrumbComponent, SmBreadcrumbItem } from './sm-breadcrumb.component';

@Component({
  standalone: true,
  imports: [SmBreadcrumbComponent],
  template: `<sm-breadcrumb [items]="items" />`
})
class SmBreadcrumbHostComponent {
  items: readonly SmBreadcrumbItem[] = [
    { label: 'Inicio', route: '/patients' },
    { label: 'Citas' }
  ];
}

describe('SmBreadcrumbComponent', () => {
  let fixture: ComponentFixture<SmBreadcrumbHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmBreadcrumbHostComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SmBreadcrumbHostComponent);
    fixture.detectChanges();
  });

  it('renders the breadcrumb navigation and linked parent item', () => {
    const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
    const list: HTMLOListElement = nav.querySelector('ol')!;
    const link: HTMLAnchorElement = list.querySelector('a')!;
    const current: HTMLElement = list.querySelector('[aria-current="page"]')!;

    expect(nav.getAttribute('aria-label')).toBe('Ruta de navegación');
    expect(list.children.length).toBe(2);
    expect(link.textContent?.trim()).toBe('Inicio');
    expect(link.getAttribute('href')).toBe('/patients');
    expect(current.textContent?.trim()).toBe('Citas');
  });

  it('renders the current page without a link when it is the only item', () => {
    fixture.componentInstance.items = [{ label: 'Pacientes', route: '/patients' }];
    fixture.detectChanges();

    const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
    const link: HTMLAnchorElement | null = nav.querySelector('a');
    const current: HTMLElement | null = nav.querySelector('[aria-current="page"]');

    expect(link).toBeNull();
    expect(current?.textContent?.trim()).toBe('Pacientes');
  });
});
