export default class CreateOrderUseCase {

    async execute({p, q}): Promise<void> {
        if (q > 0) {
            if (q < 5) {
                if (p.stock > 0) {
                    new order(p, q);

                    // enregistre la commande en BDD
                }
            }
        }
    }

}