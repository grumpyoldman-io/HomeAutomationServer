import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

const description = 'Redirects to the Github repository of this project';

@Controller()
@ApiTags('App')
export class AppController {
  @Get()
  @Redirect('https://github.com/grumpyoldman-io/HomeAutomationServer', 302)
  @ApiResponse({ status: 302, description })
  redirect() {
    return description;
  }
}
