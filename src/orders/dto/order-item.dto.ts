import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({
    example: 1,
    description: 'The unique ID of the product being ordered',
  })
  @IsInt({ message: 'productId must be an integer' })
  @IsNotEmpty({ message: 'productId is required' })
  productId!: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product being ordered (must be at least 1)',
  })
  @IsInt({ message: 'quantity must be an integer' })
  @Min(1, { message: 'quantity must be at least 1' })
  @IsNotEmpty({ message: 'quantity is required' })
  quantity!: number;
}
