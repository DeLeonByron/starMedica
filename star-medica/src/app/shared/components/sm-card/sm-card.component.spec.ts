import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmCardComponent } from './sm-card.component';

@Component({
  standalone: true,
  imports: [SmCardComponent],
  template: `
    <sm-card
      [variant]="variant"
      [padding]="padding"
      [ariaLabel]="ariaLabel"
    >
      <h2>Resumen del paciente</h2>
      <p>Contenido de la tarjeta.</p>
    </sm-card>
  `
})
class SmCardHostComponent {
  variant: 'default' | 'outlined' | 'elevated' = 'default';
  padding: 'none' | 'compact' | 'comfortable' = 'comfortable';
  ariaLabel = 'Información del paciente';
}

describe('SmCardComponent', () => {
  let fixture: ComponentFixture<SmCardHostComponent>;
  let host: SmCardHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmCardHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmCardHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('uses an article landmark, projects content and supports an accessible name', () => {
    const card: HTMLElement = fixture.nativeElement.querySelector('article');

    expect(card.getAttribute('aria-label')).toBe('Información del paciente');
    expect(card.querySelector('h2')?.textContent).toBe('Resumen del paciente');
    expect(card.textContent).toContain('Contenido de la tarjeta.');
    expect(card.classList).toContain('sm-card--default');
    expect(card.classList).toContain('sm-card--padding-comfortable');
  });

  it('applies each visual variant and padding option', () => {
    const card: HTMLElement = fixture.nativeElement.querySelector('article');
    const variants = ['outlined', 'elevated'] as const;
    const paddings = ['none', 'compact'] as const;

    for (const variant of variants) {
      host.variant = variant;
      fixture.detectChanges();
      expect(card.classList).toContain(`sm-card--${variant}`);
    }

    for (const padding of paddings) {
      host.padding = padding;
      fixture.detectChanges();
      expect(card.classList).toContain(`sm-card--padding-${padding}`);
    }
  });
});
