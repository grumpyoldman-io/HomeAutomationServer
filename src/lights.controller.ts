import {
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { LightService } from './lights.service';
import { LightMap } from './types';

@Controller('lights')
export class LightController {
  constructor(private readonly service: LightService) {}

  @Get()
  @Header('Cache-Control', 'none')
  async status(): Promise<LightMap> {
    return await this.service.status();
  }

  @Get(':name')
  @Header('Cache-Control', 'none')
  async light(@Param('name') name: string): Promise<LightMap> {
    try {
      return await this.service.status(name);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  @Get(':name/toggle')
  @Header('Cache-Control', 'none')
  async lightToggle(@Param('name') name: string): Promise<string> {
    try {
      return await this.service.toggle(name);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof Error) {
      if (error.message === 'Light not found') {
        return new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Light not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    return error;
  }
}
