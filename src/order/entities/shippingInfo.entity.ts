import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Order } from './order.entity';
import { Address } from 'src/address/entities/address.entity';
import { shippingCarrierEnum } from '../enums/shippingCarrier.enum';
import { shippingInfoStatusEnum } from '../enums/shippingInfoStatus.enum';

@Entity('shipping_info')
export class ShippingInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Order, (order) => order.shippingInfo)
  order: Order;

  @ManyToOne(() => Address, (address) => address.id)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @Column({ name: 'shipping_carrier', enum: shippingCarrierEnum })
  shippingCarrier: shippingCarrierEnum;

  // @Column({ name: 'estimate_delivery_date' })
  // estimateDeliveryDate: Date;

  @Column({ name: 'tracking_number' })
  trackingNumber: number;

  @Column({ name: 'shipping_cost' })
  shippingCost: number;

  @Column({ enum: shippingInfoStatusEnum, default: shippingInfoStatusEnum.PROCESSING })
  status: shippingInfoStatusEnum;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  createdAt: Date;
}
