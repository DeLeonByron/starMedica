export interface Environment {
  readonly production: boolean;
  readonly apiUrl: string;
  readonly googleClientId: string;
  readonly mapTileLayerUrl: string;
  readonly mapTileAttribution: string;
}