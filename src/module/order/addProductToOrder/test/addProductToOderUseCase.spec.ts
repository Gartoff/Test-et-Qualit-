import { describe, expect, test } from '@jest/globals';
import { AddProductToOrderUseCase } from '../addProductToOrderUseCase';
import { AddProductToOrderRepository } from '../addProductToOrderRepository';
import { Order, OrderItem, OrderStatus } from '../../Order';
import { Product } from '../../../product/Product';

class AddProductToOrderInMemoryRepository implements AddProductToOrderRepository {
    public storedOrder: Order | null;
    public storedProduct: Product | null;

    constructor(order: Order | null, product: Product | null) {
        this.storedOrder = order;
        this.storedProduct = product;
    }

    async findOrderById(): Promise<Order | null> {
        return this.storedOrder;
    }

    async findProductById(): Promise<Product | null> {
        return this.storedProduct;
    }

    async save(order: Order): Promise<void> {
        this.storedOrder = order;
    }
}

function buildOrder(items: OrderItem[]): Order {
    const order = new Order();
    order.id = 1;
    order.items = items;
    order.totalPrice = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    order.status = OrderStatus.PENDING;
    return order;
}

function buildProduct(id: number, price: number): Product {
    const product = new Product({
        title: `product-${id}`,
        description: 'desc',
        price
    });
    product.id = id;
    return product;
}

describe('US-2 : Ajouter un produit à une commande', () => {
    test('Scénario 1 : ajout réussi, produit n’existe pas dans la commande', async () => {
        const order = buildOrder([]);
        const product = buildProduct(2, 100);
        const repository = new AddProductToOrderInMemoryRepository(order, product);
        const useCase = new AddProductToOrderUseCase(repository);

        await useCase.execute({ orderId: 1, productId: 2, quantity: 1 });

        expect(repository.storedOrder?.items).toHaveLength(1);
        expect(repository.storedOrder?.items[0].productId).toBe(2);
        expect(repository.storedOrder?.items[0].quantity).toBe(1);
        expect(repository.storedOrder?.totalPrice).toBe(100);
    });

    test('Scénario 2 : ajout réussi, produit existe déjà dans la commande', async () => {
        const order = buildOrder([{ productId: 2, quantity: 2, unitPrice: 50 }]);
        const product = buildProduct(2, 50);
        const repository = new AddProductToOrderInMemoryRepository(order, product);
        const useCase = new AddProductToOrderUseCase(repository);

        await useCase.execute({ orderId: 1, productId: 2, quantity: 1 });

        expect(repository.storedOrder?.items[0].quantity).toBe(3);
        expect(repository.storedOrder?.totalPrice).toBe(150);
    });

    test('Scénario 3 : ajout échoué, dépassement du nombre maximum de produits', async () => {
        const items: OrderItem[] = [
            { productId: 1, quantity: 1, unitPrice: 10 },
            { productId: 2, quantity: 1, unitPrice: 10 },
            { productId: 3, quantity: 1, unitPrice: 10 },
            { productId: 4, quantity: 1, unitPrice: 10 },
            { productId: 5, quantity: 1, unitPrice: 10 }
        ];
        const order = buildOrder(items);
        const product = buildProduct(6, 20);
        const repository = new AddProductToOrderInMemoryRepository(order, product);
        const useCase = new AddProductToOrderUseCase(repository);

        await expect(
            useCase.execute({ orderId: 1, productId: 6, quantity: 1 })
        ).rejects.toThrow('nombre maximum de produits atteint');
    });

    test('Scénario 4 : ajout échoué, dépassement du montant maximum de la commande', async () => {
        const order = buildOrder([{ productId: 1, quantity: 19, unitPrice: 100 }]);
        const product = buildProduct(2, 200);
        const repository = new AddProductToOrderInMemoryRepository(order, product);
        const useCase = new AddProductToOrderUseCase(repository);

        await expect(
            useCase.execute({ orderId: 1, productId: 2, quantity: 1 })
        ).rejects.toThrow('montant maximum de la commande dépassé');
    });
});