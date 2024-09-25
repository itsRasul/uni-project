import { Repository, FindOptionsWhere } from 'typeorm';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Address } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/User.entity';
import { CreateAddressDto } from './dtos/create-address.dto';

@Injectable()
export class AddressService {
  constructor(@InjectRepository(Address) private addressRepo: Repository<Address>) {}

  async createAddress(body: CreateAddressDto, user: User) {
    const createdAddress = this.addressRepo.create({ ...body, user });

    const address = await this.addressRepo.save(createdAddress);

    return address;
  }

  async deleteMyAddress(addressId: number, user: User) {
    console.log({ user });
    const address = await this.addressRepo.findOne({
      where: {
        id: addressId,
        user: {
          id: user.id,
        },
      },
    });

    if (!address) {
      throw new NotFoundException('address is not found, or it is not belonging to you');
    }

    const { affected } = await this.addressRepo.delete(addressId);

    return affected;
  }

  async getAllAddressesBelongingtoAUser(user: User) {
    const addresses = await this.addressRepo.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    return addresses;
  }

  async findBy(where: FindOptionsWhere<Address>) {
    const address = await this.addressRepo.findOne({ where });

    console.log({address})

    if (!address) {
      throw new NotFoundException('address is not found');
    }

    return address;
  }
}
