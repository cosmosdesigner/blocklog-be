import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch,
  Body, 
  Param, 
  Query,
  Request,
  UseGuards,
  ParseUUIDPipe 
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBlockDto, UpdateBlockDto, BlockQueryDto, ResolveBlockDto } from '../dto';
import { AuthenticatedRequest } from '../common/interfaces';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() createBlockDto: CreateBlockDto) {
    return this.blocksService.create(req.user.id, createBlockDto);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest, @Query() query: BlockQueryDto) {
    return this.blocksService.findAll(req.user.id, query);
  }

  @Get('ongoing')
  async getOngoingBlocks(@Request() req: AuthenticatedRequest) {
    return this.blocksService.getOngoingBlocks(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.blocksService.findOne(id, req.user.id);
  }

  @Put(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBlockDto: UpdateBlockDto
  ) {
    return this.blocksService.update(id, req.user.id, updateBlockDto);
  }

  @Patch(':id/resolve')
  async resolve(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resolveBlockDto?: ResolveBlockDto
  ) {
    return this.blocksService.resolve(id, req.user.id, resolveBlockDto?.resolvedAt);
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    await this.blocksService.remove(id, req.user.id);
    return { message: 'Block deleted successfully' };
  }
}
