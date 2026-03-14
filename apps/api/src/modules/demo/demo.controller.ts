import { Controller, Post, Body } from '@nestjs/common';
import { DemoService } from './demo.service';
import { CreateDemoRequestDto } from './dto/create-demo-request.dto';

@Controller('demo')
export class DemoController {
    constructor(private readonly demoService: DemoService) { }

    @Post('request')
    async requestDemo(@Body() createDemoRequestDto: CreateDemoRequestDto) {
        return this.demoService.create(createDemoRequestDto);
    }
}
