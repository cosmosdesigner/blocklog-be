import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTagDto, UpdateTagDto } from '../dto';
import { AuthenticatedRequest } from '../common/interfaces';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(req.user.id, createTagDto);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.tagsService.findAll(req.user.id);
  }

  @Get('stats')
  async getTagStats(@Request() req: AuthenticatedRequest) {
    return this.tagsService.getTagStats(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.findOne(id, req.user.id);
  }

  @Put(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagDto: UpdateTagDto
  ) {
    return this.tagsService.update(id, req.user.id, updateTagDto);
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    await this.tagsService.remove(id, req.user.id);
    return { message: 'Tag deleted successfully' };
  }
}
