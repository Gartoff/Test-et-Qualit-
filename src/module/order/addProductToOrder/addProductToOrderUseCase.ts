import { AddProductToOrderRepository } from './addProductToOrderRepository';
import { MIN_ORDER_ITEM_QUANTITY } from '../Order';

type AddProductToOrderCommand = {
    orderId: number;
    productId: number;
    quantity: number;
};

export class AddProductToOrderUseCase {
    constructor(private addProductToOrderRepository: AddProductToOrderRepository) {}

    async execute(command: AddProductToOrderCommand): Promise<void> {
        const { orderId, productId, quantity } = command;

        if (!Number.isInteger(quantity) || quantity < MIN_ORDER_ITEM_QUANTITY) {
            throw new Error('quantite invalide');
        }

        const order = await this.addProductToOrderRepository.findOrderById(orderId);
        if (!order) {
            throw new Error('Commande non trouvee');
        }

        const product = await this.addProductToOrderRepository.findProductById(productId);
        if (!product) {
            throw new Error('Produit non trouve');
        }

        order.addProduct(product, quantity);

        try {
            await this.addProductToOrderRepository.save(order);
        } catch (error) {
            throw new Error('erreur lors de la sauvegarde de la commande');
        }
    }
}
