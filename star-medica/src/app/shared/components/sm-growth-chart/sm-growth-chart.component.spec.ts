import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmGrowthChartComponent, SmGrowthMeasurement } from './sm-growth-chart.component';

@Component({
  standalone: true,
  imports: [SmGrowthChartComponent],
  template: `
    <sm-growth-chart
      title="Evolución de peso"
      unit="kg"
      [measurements]="measurements"
    />
  `
})
class SmGrowthChartHostComponent {
  measurements: readonly SmGrowthMeasurement[] = [
    { date: '2026-01-15T12:00:00Z', value: 18.5 },
    { date: '2026-03-15T12:00:00Z', value: 19.2 }
  ];
}

describe('SmGrowthChartComponent', () => {
  let fixture: ComponentFixture<SmGrowthChartHostComponent>;
  let host: SmGrowthChartHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmGrowthChartHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmGrowthChartHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders observed measurements, accessible labels and a tabular alternative', () => {
    const chart: HTMLElement = fixture.nativeElement.querySelector('.sm-growth-chart');
    const graphic: SVGElement | null = chart.querySelector('svg[role="img"]');
    const table: HTMLTableElement | null = chart.querySelector('table');

    expect(graphic?.getAttribute('aria-label')).toContain('2 mediciones en kg');
    expect(chart.querySelectorAll('circle').length).toBe(2);
    expect(chart.querySelector('polyline')?.getAttribute('points')).toBeTruthy();
    expect(table?.querySelectorAll('tbody tr').length).toBe(2);
    expect(chart.textContent).toContain('no incluye percentiles ni valoración clínica');
  });

  it('shows an explicit empty state when there are no measurements', () => {
    host.measurements = [];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent)
      .toContain('No hay mediciones registradas');
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('rejects invalid measurements rather than silently plotting them', () => {
    host.measurements = [
      { date: 'not-a-date', value: 18.5 },
      { date: '2026-03-15T12:00:00Z', value: -2 }
    ];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('contiene una medición inválida');
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('sorts measurements by their recorded dates', () => {
    host.measurements = [
      { date: '2026-03-15T12:00:00Z', value: 19.2 },
      { date: '2026-01-15T12:00:00Z', value: 18.5 }
    ];
    fixture.detectChanges();

    const rows: HTMLTableRowElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr')
    );
    expect(rows[0].textContent).toContain('18.5');
    expect(rows[1].textContent).toContain('19.2');
  });

  it('centers a single measurement in the chart', () => {
    host.measurements = [{ date: '2026-03-15T12:00:00Z', value: 19.2 }];
    fixture.detectChanges();

    const point: SVGCircleElement = fixture.nativeElement.querySelector('circle');
    expect(Number(point.getAttribute('cx'))).toBeCloseTo(388, 0);
  });
});
