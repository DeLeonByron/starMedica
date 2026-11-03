import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  input,
  signal,
  viewChild
} from '@angular/core';
import * as L from 'leaflet';

export interface SmMapCoordinate {
  latitude: number;
  longitude: number;
}

export interface SmMapLocation extends SmMapCoordinate {
  label: string;
}

@Component({
  selector: 'sm-map',
  standalone: true,
  templateUrl: './sm-map.component.html',
  styleUrl: './sm-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly locations = input<readonly SmMapLocation[]>([]);
  readonly center = input<SmMapCoordinate | null>(null);
  readonly zoom = input(13);
  readonly tileLayerUrl = input('');
  readonly tileAttribution = input('');
  readonly mapLabel = input('Mapa de ubicaciones');
  readonly status = signal('El mapa requiere un proveedor configurado y ubicaciones con coordenadas.');
  protected readonly mapAvailable = signal(false);

  protected readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  private map?: L.Map;
  private tileLayer?: L.TileLayer;
  private markerLayer?: L.LayerGroup;
  private currentTileLayerUrl = '';
  private currentTileAttribution = '';
  private viewInitialized = false;

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.renderMap();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.renderMap();
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  private renderMap(): void {
    const container = this.mapContainer()?.nativeElement;
    if (!this.viewInitialized || !container) {
      return;
    }

    const configurationError = this.getConfigurationError();
    if (configurationError) {
      this.destroyMap();
      this.status.set(configurationError);
      return;
    }

    const center = this.center()!;
    if (!this.map) {
      this.map = L.map(container).setView([center.latitude, center.longitude], this.zoom());
      this.markerLayer = L.layerGroup().addTo(this.map);
    } else {
      this.map.setView([center.latitude, center.longitude], this.zoom());
    }

    if (
      !this.tileLayer
      || this.tileLayerUrl() !== this.currentTileLayerUrl
      || this.tileAttribution() !== this.currentTileAttribution
    ) {
      this.tileLayer?.remove();
      this.tileLayer = L.tileLayer(this.tileLayerUrl(), {
        attribution: this.tileAttribution()
      }).addTo(this.map);
      this.currentTileLayerUrl = this.tileLayerUrl();
      this.currentTileAttribution = this.tileAttribution();
      this.tileLayer.on('tileerror', () => {
        this.status.set('No se pudo cargar una parte del mapa. Verifica el proveedor cartográfico.');
      });
    }

    this.markerLayer?.clearLayers();
    for (const location of this.locations()) {
      const popup = document.createElement('span');
      popup.textContent = location.label;
      L.marker([location.latitude, location.longitude])
        .bindPopup(popup)
        .addTo(this.markerLayer!);
    }

    this.status.set('');
    this.mapAvailable.set(true);
    queueMicrotask(() => this.map?.invalidateSize());
  }

  private getConfigurationError(): string | null {
    const tileUrl = this.tileLayerUrl().trim();
    const center = this.center();
    const locations = this.locations();

    if (!tileUrl || !this.tileAttribution().trim()) {
      return 'El mapa no está disponible hasta configurar un proveedor cartográfico y su atribución.';
    }

    if (!center || locations.length === 0) {
      return 'No hay ubicaciones con coordenadas disponibles para mostrar en el mapa.';
    }

    const templateUrl = tileUrl.replace(/\{(?:z|x|y|s)\}/g, '0');
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(templateUrl);
    } catch {
      return 'La dirección del proveedor cartográfico no es válida.';
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return 'El proveedor cartográfico debe usar una dirección HTTP o HTTPS.';
    }

    if (!this.isValidCoordinate(center) || locations.some((location) => !this.isValidCoordinate(location))) {
      return 'Una o más ubicaciones tienen coordenadas fuera del rango permitido.';
    }

    if (!Number.isInteger(this.zoom()) || this.zoom() < 0 || this.zoom() > 19) {
      return 'El nivel de acercamiento debe ser un entero entre 0 y 19.';
    }

    if (locations.some((location) => !location.label.trim())) {
      return 'Cada ubicación del mapa debe tener una etiqueta.';
    }

    return null;
  }

  private isValidCoordinate(coordinate: SmMapCoordinate): boolean {
    return Number.isFinite(coordinate.latitude)
      && coordinate.latitude >= -90
      && coordinate.latitude <= 90
      && Number.isFinite(coordinate.longitude)
      && coordinate.longitude >= -180
      && coordinate.longitude <= 180;
  }

  private destroyMap(): void {
    this.map?.remove();
    this.map = undefined;
    this.tileLayer = undefined;
    this.markerLayer = undefined;
    this.currentTileLayerUrl = '';
    this.currentTileAttribution = '';
    this.mapAvailable.set(false);
  }
}
