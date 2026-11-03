import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmTableComponent } from './sm-table.component';

@Component({
  standalone: true,
  imports: [SmTableComponent],
  template: `
    <sm-table ariaLabel="Lista de pacientes" caption="Pacientes registrados">
      <thead>
        <tr><th scope="col">Código</th><th scope="col">Nombre</th></tr>
      </thead>
      <tbody>
        <tr><td>SM-001</td><th scope="row">Paciente</th></tr>
      </tbody>
    </sm-table>
  `
})
class SmTableHostComponent {}

describe('SmTableComponent', () => {
  let fixture: ComponentFixture<SmTableHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmTableHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmTableHostComponent);
    fixture.detectChanges();
  });

  it('provides a keyboard-accessible named region and table caption', () => {
    const region: HTMLDivElement = fixture.nativeElement.querySelector('[role="region"]');
    const caption: HTMLElement | null = fixture.nativeElement.querySelector('caption');

    expect(region.getAttribute('aria-label')).toBe('Lista de pacientes');
    expect(region.tabIndex).toBe(0);
    expect(caption?.textContent?.trim()).toBe('Pacientes registrados');
  });

  it('projects semantic table headings and rows without changing their structure', () => {
    const table: HTMLTableElement = fixture.nativeElement.querySelector('table');

    expect(table.querySelectorAll('thead th').length).toBe(2);
    expect(table.querySelector('tbody th[scope="row"]')?.textContent).toBe('Paciente');
    expect(table.querySelector('tbody td')?.textContent).toBe('SM-001');
  });
});
