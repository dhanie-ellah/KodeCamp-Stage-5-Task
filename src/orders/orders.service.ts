import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private mailService: MailService,
  ) {}

  async create(userId: number, dto: CreateOrderDto) {
    const productIds = dto.items.map((i) => i.productId);

    const products = await this.productRepo.findBy({ id: In(productIds) });

    if (products.length !== new Set(productIds).size) {
      throw new BadRequestException('One or more products not found');
    }

    const orderItems: OrderItem[] = dto.items.map((itemDto) => {
      const product = products.find((p) => p.id === itemDto.productId);

      if (!product)
        throw new NotFoundException(`Product ${itemDto.productId} not found`);

      const orderItem = new OrderItem();
      orderItem.productId = product.id;
      orderItem.productName = product.name;
      orderItem.quantity = itemDto.quantity;
      orderItem.unitPrice = product.cost;
      return orderItem;
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    const order = this.orderRepo.create({
      userId,
      items: orderItems,
      totalAmount,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepo.save(order);

    const orderWithUser = await this.orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: ['user', 'items'],
    });

    if (!orderWithUser?.user?.email) {
      throw new BadRequestException(
        'Unable to send confirmation email: order has no associated user',
      );
    }

    await this.sendOrderConfirmationEmail(orderWithUser);

    return orderWithUser;
  }

  async updateStatus(orderId: number, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'items'],
    });

    if (!order) throw new NotFoundException('Order not found');

    order.status = dto.status;
    const updated = await this.orderRepo.save(order);

    await this.sendStatusUpdateEmail(updated);
    return updated;
  }

  private async sendOrderConfirmationEmail(order: Order) {
    await this.mailService.sendEmail({
      to: order.user.email,
      subject: `Order #${order.id} Confirmation`,
      body: `
        <h1>Hi ${order.user.name}</h1>
        <p>Thanks for your order #${order.id}</p>
        <ul>
          ${order.items.map((i) => `<li>${i.productName} x ${i.quantity} - $${i.unitPrice}</li>`).join('')}
        </ul>
        <h3>Total: $${order.totalAmount}</h3>
      `,
    });
  }

  private async sendStatusUpdateEmail(order: Order) {
    await this.mailService.sendEmail({
      to: order.user.email,
      subject: `Order #${order.id} Status Updated`,
      body: `<p>Hi ${order.user.name}, your order #${order.id} is now <b>${order.status}</b></p>`,
    });
  }
}
