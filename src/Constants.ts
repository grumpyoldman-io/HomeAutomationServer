export enum Constants {
  NOT_FOUND = 'NOT_FOUND',
}

export const ENV_PATHS = [
  `.env.${process.env.NODE_ENV}.local`,
  `.env.${process.env.NODE_ENV}`,
  '.env.local',
  '.env',
];
