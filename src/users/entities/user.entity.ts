import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum roles {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'daniella@braide.com' })
  @Column({ unique: true })
  email!: string;

  @ApiProperty({ example: 'Daniella Braide' })
  @Column()
  name!: string;

  @Column()
  password!: string;

  @ApiProperty({ example: 'user' })
  @Column({ type: 'enum', enum: roles, default: roles.USER })
  role!: roles;

  @OneToMany(() => Product, (product) => product.createdBy)
  products!: Product[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
