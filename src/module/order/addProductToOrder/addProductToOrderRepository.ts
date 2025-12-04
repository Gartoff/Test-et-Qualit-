import { Order } from '../Order';
import { Product } from '../../product/Product';

export interface AddProductToOrderRepository {
    findOrderById(orderId: number): Promise<Order | null>;
    findProductById(productId: number): Promise<Product | null>;
    save(order: Order): Promise<void>;
}