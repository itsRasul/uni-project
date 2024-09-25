import { IsEnum, IsNotEmpty } from 'class-validator';
import replyStatusEnum from '../enums/replyStatus.enum';

export class UpdateReplyDto {
  @IsNotEmpty()
  @IsEnum(replyStatusEnum)
  status: replyStatusEnum;
}
