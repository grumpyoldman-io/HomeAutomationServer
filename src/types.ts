import type { model } from 'node-hue-api';

export interface Light extends Pick<model.Light, 'id' | 'name'> {
  on: boolean;
}

export const isLight = (light: unknown): light is Light => {
  return (
    typeof light === 'object' &&
    light !== null &&
    'id' in light &&
    'name' in light &&
    'on' in light
  );
};
