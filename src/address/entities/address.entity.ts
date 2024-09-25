import { User } from 'src/user/User.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { countryEnum } from '../enums/country.enum';
import { cityEnum } from '../enums/city.enum';
import { provinceEnum } from '../enums/province.enum';
import { Order } from 'src/order/entities/order.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.addresses, {
    nullable: false,
  })
  user: User;

  @Column()
  country: countryEnum;

  @Column()
  province: provinceEnum;

  @Column()
  city: cityEnum;

  @Column()
  address: string;

  @Column({ name: 'post_code', length: 10 })
  postCode: string;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  createdAt: Date;
}
