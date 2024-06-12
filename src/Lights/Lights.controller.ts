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
  async status(): ReturnType<LightsService['statusAll']> {
    return await this.service.statusAll();
  }

  @Get('toggle')
  @Header('Cache-Control', 'none')
  @ApiOperation({
    summary: 'Toggle all lights on/off',
  })
  @ApiResponse({ status: 200, description: 'Toggled all lights' })
  async lightsToggle(): ReturnType<LightsService['toggleAll']> {
    try {
      return await this.service.toggleAll();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  @Get('store')
  @Header('Cache-Control', 'none')
  @ApiOperation({
    summary: 'Store status for all lights',
  })
  async store(): ReturnType<LightsService['store']> {
    return await this.service.store();
  }

  @Get(':name')
  @Header('Cache-Control', 'none')
  @ApiOperation({
    summary: 'Get status light status',
  })
  @ApiParam({ name: 'name', required: true })
  @ApiResponse({ status: 200, description: 'Status of single light' })
  @ApiResponse({ status: 404, description: 'Light not found' })
  async light(
    @Param('name') name: string,
  ): ReturnType<LightsService['status']> {
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
  async lightToggle(
    @Param('name') name: string,
  ): ReturnType<LightsService['toggle']> {
    try {
      return await this.service.toggle(name);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  @Get(':name/set/:val')
  @Header('Cache-Control', 'none')
  @ApiOperation({
    summary: 'Set a light on/off',
  })
  @ApiParam({ name: 'name', required: true })
  @ApiParam({ name: 'val', required: true, enum: ['on', 'off'] })
  @ApiResponse({ status: 200, description: 'Set single light' })
  @ApiResponse({ status: 404, description: 'Light not found' })
  async lightSetOnOff(
    @Param('name') name: string,
    @Param('val') val: string,
  ): ReturnType<LightsService['setOnOff']> {
    try {
      return await this.service.setOnOff(name, val === 'on');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  @Get(':name/set/brightness/:val')
  @Header('Cache-Control', 'none')
  @ApiOperation({
    summary: 'Set a light on/off',
  })
  @ApiParam({ name: 'name', required: true })
  @ApiParam({ name: 'val', required: true, type: 'number' })
  @ApiResponse({ status: 200, description: 'Set single light' })
  @ApiResponse({ status: 404, description: 'Light not found' })
  async lightSetBrightness(
    @Param('name') name: string,
    @Param('val') val: number,
  ): ReturnType<LightsService['setBrightness']> {
    try {
      return await this.service.setBrightness(
        name,
        Math.min(100, Math.max(1, val)),
      );
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
