import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmLoaderComponent } from './sm-loader.component';

describe('SmLoaderComponent', () => {
  let fixture: ComponentFixture<SmLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmLoaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmLoaderComponent);
    fixture.detectChanges();
  });

  it('announces its label as a polite status', () => {
    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');

    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.getAttribute('aria-label')).toBe('Cargando...');
    expect(status.textContent).toContain('Cargando...');
    expect(status.querySelector('.sm-loader__spinner')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('supports configurable labels, sizes and inline layout', () => {
    fixture.componentRef.setInput('label', 'Guardando paciente...');
    fixture.componentRef.setInput('size', 'large');
    fixture.componentRef.setInput('inline', true);
    fixture.detectChanges();

    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');

    expect(status.getAttribute('aria-label')).toBe('Guardando paciente...');
    expect(status.textContent).toContain('Guardando paciente...');
    expect(status.classList).toContain('sm-loader--large');
    expect(status.classList).toContain('sm-loader--inline');
  });
});
