import { cityEnum } from 'src/address/enums/city.enum';
import { countryEnum } from 'src/address/enums/country.enum';
import { provinceEnum } from 'src/address/enums/province.enum';

export interface CooperatorAddress {
  country: countryEnum;
  province: provinceEnum;
  city: cityEnum;
  address: string;
  postCode: string;
}
