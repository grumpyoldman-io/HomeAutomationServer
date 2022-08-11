import type { model } from 'node-hue-api';

export interface Light extends Pick<model.Light, 'id' | 'name'> {
  on: boolean;
}

export type LightMap = Record<Light['name'], Light>;
