import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  key: string;

  @Column({})
  value: string;
}
