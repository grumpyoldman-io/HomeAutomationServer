import {
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { NotFoundError } from '../Errors';
import { LightMap } from '../types';

import { LightsService } from './Lights.service';

@Controller('lights')
@ApiTags('Lights')
export class LightsController {
  constructor(private readonly service: LightsService) {}

  @Get()
  @Header('Cache-Control', 'none')
  @ApiOperation({
    summary: 'Get status for all lights',
  })
  async status(): Promise<LightMap> {
    return await this.service.status();
  }

  @Get(':name')
  @Header('Cache-Control', 'none')
  @ApiOperation({
    summary: 'Get status light status',
  })
  @ApiParam({ name: 'name', required: true })
  @ApiResponse({ status: 200, description: 'Status of single light' })
  @ApiResponse({ status: 404, description: 'Light not found' })
  async light(@Param('name') name: string): Promise<LightMap> {
    try {
      return await this.service.status(name);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  @Get(':name/toggle')
  @Header('Cache-Control', 'none')
  @ApiOperation({
    summary: 'Toggle a light on/off',
  })
  @ApiParam({ name: 'name', required: true })
  @ApiResponse({ status: 200, description: 'Toggled single light' })
  @ApiResponse({ status: 404, description: 'Light not found' })
  async lightToggle(@Param('name') name: string): Promise<string> {
    try {
      return await this.service.toggle(name);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof NotFoundError) {
      return new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return error;
  }
}
