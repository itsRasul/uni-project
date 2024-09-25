import { Module, OnModuleInit } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './setting.entity';
import { UserModule } from 'src/user/user.module';
import { settingKeys } from './enums/setting.enum';

@Module({
  imports: [TypeOrmModule.forFeature([Setting]), UserModule],
  providers: [SettingService],
  controllers: [SettingController],
})
export class SettingModule implements OnModuleInit {
  constructor(private settingService: SettingService) {}
  async onModuleInit() {
    const promises: Promise<Setting>[] = [];
    promises.push(this.settingService.findOrCreate(settingKeys.PHONE, '021-88223344'));
    promises.push(this.settingService.findOrCreate(settingKeys.COMPANY_ADDRESS, 'تهران میدان انقلاب'));
    promises.push(this.settingService.findOrCreate(settingKeys.ABOUT_US, 'متن پیشفرض درباره ما'));
    promises.push(this.settingService.findOrCreate(settingKeys.SLIDERS, '[]'));
    promises.push(this.settingService.findOrCreate(settingKeys.BANNERS, '[]'));
    await Promise.all(promises);
  }
}
