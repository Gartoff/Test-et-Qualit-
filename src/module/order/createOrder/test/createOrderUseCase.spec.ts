import { describe, expect, test } from '@jest/globals';
import { Order } from '../../Order';
import { CreateOrderRepository } from '../createOrderRepository';
import { CreateOrderUseCase } from '../createOrderUseCase';

class CreateOrderDummyRepository implements CreateOrderRepository {
    public savedOrder: Order | undefined;

    async save(order: Order): Promise<void> {
        this.savedOrder = order;
    }
}

class CreateOrderMockFailRepository implements CreateOrderRepository {
    async save(): Promise<void> {
        throw new Error('unexpected persistence error');
    }
}

describe('US - Creer une commande', () => {
    test('creer une commande reussie', async () => {
        const repository = new CreateOrderDummyRepository();
        const useCase = new CreateOrderUseCase(repository);

        await expect(
            useCase.execute({
                productIds: [1, 2],
                totalPrice: 200
            })
        ).resolves.not.toThrow();

        expect(repository.savedOrder?.productIds).toEqual([1, 2]);
        expect(repository.savedOrder?.totalPrice).toBe(200);
    });

    test('echec si aucun produit envoye', async () => {
        const repository = new CreateOrderDummyRepository();
        const useCase = new CreateOrderUseCase(repository);

        await expect(
            useCase.execute({
                productIds: [],
                totalPrice: 50
            })
        ).rejects.toThrow('la commande doit contenir au moins un produit');
    });

    test('echec si plus de 5 produits', async () => {
        const repository = new CreateOrderDummyRepository();
        const useCase = new CreateOrderUseCase(repository);

        const action = useCase.execute({
            productIds: [1, 2, 3, 4, 5, 6],
            totalPrice: 120
        });

        await expect(action).rejects.toThrow('la commande ne peut pas contenir plus de 5 produits');
        expect(repository.savedOrder).toBeUndefined();
    });

    test('echec si un identifiant produit est invalide', async () => {
        const repository = new CreateOrderDummyRepository();
        const useCase = new CreateOrderUseCase(repository);

        await expect(
            useCase.execute({
                productIds: [1, -2],
                totalPrice: 20
            })
        ).rejects.toThrow('les identifiants produits doivent etre des entiers positifs');
    });

    test('echec si prix total inferieur a 2', async () => {
        const repository = new CreateOrderDummyRepository();
        const useCase = new CreateOrderUseCase(repository);

        await expect(
            useCase.execute({
                productIds: [1],
                totalPrice: 1
            })
        ).rejects.toThrow('le prix total doit etre superieur ou egal a 2');
    });

    test('echec si prix total superieur a 500', async () => {
        const repository = new CreateOrderDummyRepository();
        const useCase = new CreateOrderUseCase(repository);

        await expect(
            useCase.execute({
                productIds: [1, 2],
                totalPrice: 600
            })
        ).rejects.toThrow('le prix total doit etre inferieur ou egal a 500');
    });

    test('echec si la sauvegarde echoue', async () => {
        const repository = new CreateOrderMockFailRepository();
        const useCase = new CreateOrderUseCase(repository);

        await expect(
            useCase.execute({
                productIds: [1],
                totalPrice: 100
            })
        ).rejects.toThrow('erreur lors de la creation de la commande');
    });
});
