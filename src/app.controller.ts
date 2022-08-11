import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('https://github.com/grumpyoldman-io/HomeAutomationServer', 302)
  redirect() {
    return 'Redirects to the Repository of this project';
  }
}
