import TemplateEnum from '../enums/template.enum';

export interface ISMSOptions {
  receptor: string;
  template: TemplateEnum;
  token: string;
}
