import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SettingService } from './setting.service';
import { UpdateSettingDto } from './dtos/update-settings.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Request } from 'express';
import { AddSliderDto } from './dtos/add-slider.dto';
import { DeleteSliderDto } from './dtos/delete-slider.dto';
import { AddBannerDto } from './dtos/add-banner.dto';
import { DeleteBannerDto } from './dtos/delete-banner.dto';

@Controller('/api/v1/settings')
export class SettingController {
  constructor(private settingService: SettingService) {}

  @Patch('/add-slider')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: multer.diskStorage({
        destination: 'public/sliders/photos',
        filename: (req: Request, file: Express.Multer.File, cb) => {
          const [fileType, extension] = file.mimetype.split('/');
          let fileName = `slider-photo-${Date.now()}.${extension}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async addSliders(
    @Body() body: AddSliderDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    body.photo = file.filename;
    const setting = await this.settingService.addSlider(body);

    return {
      status: 'success',
      message: 'slider is addded successfully',
      data: {
        setting,
      },
    };
  }

  @Delete('/delete-slider')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async deleteSliders(@Body() body: DeleteSliderDto) {
    const setting = await this.settingService.deleteSlider(body);

    return {
      status: 'success',
      message: 'slider is deleted successfully',
      data: {
        setting,
      },
    };
  }

  @Patch('/add-banner')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: multer.diskStorage({
        destination: 'public/banners/photos',
        filename: (req: Request, file: Express.Multer.File, cb) => {
          const [fileType, extension] = file.mimetype.split('/');
          let fileName = `banner-photo-${Date.now()}.${extension}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async addBanner(
    @Body() body: AddBannerDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log('hereeeeeee')
    body.photo = file.filename;
    const setting = await this.settingService.addBanner(body);

    return {
      status: 'success',
      message: 'banner is addded successfully',
      data: {
        setting,
      },
    };
  }

  @Delete('/delete-banner')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async deleteBanner(@Body() body: DeleteBannerDto) {
    const setting = await this.settingService.deleteBanner(body);

    return {
      status: 'success',
      message: 'banner is deleted successfully',
      data: {
        setting,
      },
    };
  }

  @Patch('/:settingId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async updateSetting(
    @Param('settingId', ParseIntPipe) settingId: number,
    @Body() body: UpdateSettingDto,
  ) {
    const setting = await this.settingService.updateSettingByKey(settingId, body);

    return {
      status: 'success',
      message: 'setting is updated successfully',
      data: {
        setting,
      },
    };
  }

  @Get('/')
  async getAllSettings() {
    const settings = await this.settingService.getAllSettings();

    return {
      status: 'success',
      message: 'setting is received successfully',
      data: {
        settings,
      },
    };
  }

  @Get('/:key')
  async getOnSetting(@Param('key') key: string) {
    const setting = await this.settingService.findBy({ key });

    return {
      status: 'success',
      message: 'setting is received successfully',
      data: {
        setting,
      },
    };
  }
}
