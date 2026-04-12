import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  findAll() {
    return this.testimonialsService.findAll();
  }

  @Post()
  create(@Body() createTestimonialDto: any) {
    return this.testimonialsService.create(createTestimonialDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTestimonialDto: any) {
    return this.testimonialsService.update(id, updateTestimonialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}
