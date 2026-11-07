import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:5067/api',
  googleClientId: '14962753427-omnr91el30dni2nuretn3rkopo7itnnm.apps.googleusercontent.com',
  mapTileLayerUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  mapTileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
};