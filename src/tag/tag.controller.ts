import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { query } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';

@Controller('/api/v1/tags')
export class TagController {
  constructor(private tagService: TagService) {}

  @Get('')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getAllTags(@Query() queryString: any) {
    const tags = await this.tagService.getAllTags(queryString);
    const tagsCount = await this.tagService.count();

    return {
      status: 'success',
      message: 'all tags are received successfully',
      data: {
        tagsCount,
        tags,
      },
    };
  }
}
