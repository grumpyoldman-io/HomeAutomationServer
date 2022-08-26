import { Constants } from './Constants';

export class NotFoundError extends Error {
  public readonly cause = Constants.NOT_FOUND;
}
