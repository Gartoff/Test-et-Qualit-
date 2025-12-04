import { Order } from '../Order';
import { CreateOrderRepository } from './createOrderRepository';

const MIN_PRODUCTS_PER_ORDER = 1;
const MAX_PRODUCTS_PER_ORDER = 5;
const MIN_PRODUCT_ID = 1;

export type CreateOrderCommand = {
    productIds: number[];
    totalPrice: number;
};

export class CreateOrderUseCase {
    private readonly orderRepository: CreateOrderRepository;

    constructor(orderRepository: CreateOrderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(command: CreateOrderCommand): Promise<void> {
        const { productIds, totalPrice } = command;

        this.validateProductIds(productIds);
        this.validateTotalPrice(totalPrice);

        const order = new Order({ productIds, totalPrice });

        try {
            await this.orderRepository.save(order);
        } catch (error) {
            throw new Error('erreur lors de la creation de la commande');
        }
    }

    private validateProductIds(productIds: number[]) {
        if (!Array.isArray(productIds)) {
            throw new Error('productIds doit etre un tableau');
        }

        if (productIds.length < MIN_PRODUCTS_PER_ORDER) {
            throw new Error('la commande doit contenir au moins un produit');
        }

        if (productIds.length > MAX_PRODUCTS_PER_ORDER) {
            throw new Error('la commande ne peut pas contenir plus de 5 produits');
        }

        const allIdsAreNumbers = productIds.every(
            (productId) => Number.isInteger(productId) && productId >= MIN_PRODUCT_ID
        );
        if (!allIdsAreNumbers) {
            throw new Error('les identifiants produits doivent etre des entiers positifs');
        }
    }

    private validateTotalPrice(totalPrice: number) {
        if (typeof totalPrice !== 'number' || Number.isNaN(totalPrice)) {
            throw new Error('le prix total doit etre un nombre');
        }

        if (totalPrice < 2) {
            throw new Error('le prix total doit etre superieur ou egal a 2');
        }

        if (totalPrice > 500) {
            throw new Error('le prix total doit etre inferieur ou egal a 500');
        }
    }
}
