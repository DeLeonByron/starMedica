import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { SmMapComponent, SmMapCoordinate, SmMapLocation } from './sm-map.component';

@Component({
  standalone: true,
  imports: [SmMapComponent],
  template: `
    <sm-map
      [locations]="locations"
      [center]="center"
      [tileLayerUrl]="tileLayerUrl"
      [tileAttribution]="tileAttribution"
    />
  `
})
class SmMapHostComponent {
  locations: readonly SmMapLocation[] = [];
  center: SmMapCoordinate | null = null;
  tileLayerUrl = environment.mapTileLayerUrl;
  tileAttribution = environment.mapTileAttribution;
}

describe('SmMapComponent', () => {
  let fixture: ComponentFixture<SmMapHostComponent>;
  let host: SmMapHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmMapHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmMapHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('uses the configured OSM provider without contacting it until coordinates exist', () => {
    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    const canvas: HTMLElement = fixture.nativeElement.querySelector('.sm-map__canvas');

    expect(status.textContent).toContain('No hay ubicaciones con coordenadas');
    expect(canvas.classList).toContain('sm-map__canvas--hidden');
  });

  it('keeps the public OSM tile URL and attribution available as provider configuration', () => {
    expect(host.tileLayerUrl).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(host.tileAttribution).toContain('OpenStreetMap contributors');
    expect(host.tileAttribution).toContain('openstreetmap.org/copyright');
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent)
      .toContain('No hay ubicaciones con coordenadas');
  });

  it('reports the absence of authorized coordinates without displaying a map', () => {
    host.tileLayerUrl = 'https://tiles.example.test/{z}/{x}/{y}.png';
    host.tileAttribution = 'Proveedor de mapas';
    fixture.detectChanges();

    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(status.textContent).toContain('No hay ubicaciones con coordenadas');
  });

  it('rejects invalid provider URLs instead of silently falling back to another service', () => {
    host.tileLayerUrl = 'javascript:alert(1)';
    host.tileAttribution = 'Proveedor de mapas';
    host.locations = [{ label: 'Sede', latitude: 14.6, longitude: -90.5 }];
    host.center = { latitude: 14.6, longitude: -90.5 };
    fixture.detectChanges();

    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(status.textContent).toContain('debe usar una dirección HTTP o HTTPS');
  });

  it('rejects coordinates outside valid latitude and longitude ranges', () => {
    host.tileLayerUrl = 'https://tiles.example.test/{z}/{x}/{y}.png';
    host.tileAttribution = 'Proveedor de mapas';
    host.locations = [{ label: 'Sede', latitude: 91, longitude: -90.5 }];
    host.center = { latitude: 14.6, longitude: -90.5 };
    fixture.detectChanges();

    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(status.textContent).toContain('fuera del rango permitido');
  });
});
