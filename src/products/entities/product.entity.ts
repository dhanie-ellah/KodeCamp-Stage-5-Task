import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Products')
export class Product {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'Products Unique Identifier',
  })
  id!: number;

  @Column('text')
  @ApiProperty({
    example: 'Samsung Galaxy Fold 4',
    description: 'The name of the product',
  })
  name!: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example:
      'Samsung Galaxy Fold 4 is a foldable smartphone with a large display and advanced features.',
    description: 'A brief description of the product',
  })
  description?: string;

  @Column({ type: 'float' })
  @ApiProperty({
    example: 470000.0,
    description: 'The cost of the product',
  })
  cost!: number;

  @Column('text', { array: true, default: [] })
  @ApiProperty({
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    description: 'Array of image URLs for the product',
  })
  picture!: string[];

  @Column({ nullable: true })
  createdById!: number;

  @ManyToOne(() => User, (user) => user.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  createdBy!: User;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'The date the product was created' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'The date the product was last updated' })
  updatedAt!: Date;
}
