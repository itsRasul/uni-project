import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './setting.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { UpdateSettingDto } from './dtos/update-settings.dto';
import { AddSliderDto } from './dtos/add-slider.dto';
import { settingKeys } from './enums/setting.enum';
import { DeleteSliderDto } from './dtos/delete-slider.dto';
import { DeleteBannerDto } from './dtos/delete-banner.dto';

@Injectable()
export class SettingService {
  constructor(@InjectRepository(Setting) private settingRepo: Repository<Setting>) {}

  async getAllSettings() {
    const settings = await this.settingRepo.find();

    return settings;
  }

  async updateSettingByKey(settingId: number, body: UpdateSettingDto) {
    const setting = await this.settingRepo.findOne({ where: { id: settingId } });

    if (!setting) {
      throw new NotFoundException('setting is not found by this id');
    }

    Object.assign(setting, body);
    return await this.settingRepo.save(setting);
  }

  async addSlider(body: AddSliderDto) {
    const setting = await this.settingRepo.findOne({ where: { key: settingKeys.SLIDERS } });

    if (!setting) {
      throw new NotFoundException('setting is not found by this id');
    }

    const value: [{ img: string; link: string }] = JSON.parse(setting.value);
    value.push({ img: body.photo, link: body.link });
    setting.value = JSON.stringify(value);

    return await this.settingRepo.save(setting);
  }

  async addBanner(body: AddSliderDto) {
    const setting = await this.settingRepo.findOne({ where: { key: settingKeys.BANNERS } });

    if (!setting) {
      throw new NotFoundException('setting is not found by this id');
    }

    const value: [{ img: string; link: string }] = JSON.parse(setting.value);
    value.push({ img: body.photo, link: body.link });
    setting.value = JSON.stringify(value);

    return await this.settingRepo.save(setting);
  }

  async deleteSlider(body: DeleteSliderDto) {
    const setting = await this.settingRepo.findOne({ where: { key: settingKeys.SLIDERS } });

    const value: [{ img: string; link: string }] = JSON.parse(setting.value);
    const valueIndex = value.findIndex((val) => val.img === body.imgSlider);
    if (valueIndex < 0) {
      throw new NotFoundException('slider is not found');
    }
    value.splice(valueIndex, 1);
    setting.value = JSON.stringify(value);

    return await this.settingRepo.save(setting);
  }

  async deleteBanner(body: DeleteBannerDto) {
    const setting = await this.settingRepo.findOne({ where: { key: settingKeys.BANNERS } });

    const value: [{ img: string; link: string }] = JSON.parse(setting.value);
    const valueIndex = value.findIndex((val) => val.img === body.imgBanner);
    if (valueIndex < 0) {
      throw new NotFoundException('banner is not found');
    }
    value.splice(valueIndex, 1);
    setting.value = JSON.stringify(value);

    return await this.settingRepo.save(setting);
  }

  async findBy(where: FindOptionsWhere<Setting>) {
    const setting = await this.settingRepo.findOne({ where });

    if (!setting) {
      throw new NotFoundException('setting is not found by this key');
    }

    return setting;
  }

  async findOrCreate(key: string, value: string) {
    const setting = await this.settingRepo.findOne({
      where: {
        key,
      },
    });

    if (!setting) {
      const newSetting = this.settingRepo.create({ key, value });
      await this.settingRepo.save(newSetting);
      return newSetting;
    }

    return setting;
  }
}
