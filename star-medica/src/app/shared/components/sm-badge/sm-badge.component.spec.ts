import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmBadgeComponent } from './sm-badge.component';

@Component({
  standalone: true,
  imports: [SmBadgeComponent],
  template: `
    <sm-badge [variant]="variant">{{ label }}</sm-badge>
  `
})
class SmBadgeHostComponent {
  variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info' = 'neutral';
  label = 'Activo';
}

describe('SmBadgeComponent', () => {
  let fixture: ComponentFixture<SmBadgeHostComponent>;
  let host: SmBadgeHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmBadgeHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmBadgeHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('projects its label and defaults to the neutral variant', () => {
    const badge: HTMLElement = fixture.nativeElement.querySelector('.sm-badge');

    expect(badge.textContent?.trim()).toBe('Activo');
    expect(badge.classList).toContain('sm-badge--neutral');
  });

  it('applies each semantic variant without changing its text', () => {
    const badge: HTMLElement = fixture.nativeElement.querySelector('.sm-badge');
    const variants = ['success', 'warning', 'danger', 'info'] as const;

    for (const variant of variants) {
      host.variant = variant;
      fixture.detectChanges();

      expect(badge.classList).toContain(`sm-badge--${variant}`);
      expect(badge.textContent?.trim()).toBe('Activo');
    }
  });
});
