import { Repository } from 'typeorm';
import AppDataSource from '../../../config/db.config';
import { Order } from '../Order';
import { Product } from '../../product/Product';
import { AddProductToOrderRepository } from './addProductToOrderRepository';

export class AddProductToOrderTypeOrmRepository implements AddProductToOrderRepository {
    private orderRepository: Repository<Order>;
    private productRepository: Repository<Product>;

    constructor() {
        this.orderRepository = AppDataSource.getRepository(Order);
        this.productRepository = AppDataSource.getRepository(Product);
    }

    async findOrderById(orderId: number): Promise<Order | null> {
        return await this.orderRepository.findOneBy({ id: orderId });
    }

    async findProductById(productId: number): Promise<Product | null> {
        return await this.productRepository.findOneBy({ id: productId });
    }

    async save(order: Order): Promise<void> {
        await this.orderRepository.save(order);
    }
}