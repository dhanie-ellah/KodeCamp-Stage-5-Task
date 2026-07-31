import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.SHIPPED,
    description: 'The new status to assign to the order',
  })
  @IsEnum(OrderStatus, {
    message: `status must be a valid enum value: ${Object.values(OrderStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'status is required' })
  status!: OrderStatus;
}
