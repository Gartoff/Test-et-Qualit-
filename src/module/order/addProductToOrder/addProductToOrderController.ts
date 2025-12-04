import { Request, Response } from 'express';
import { AddProductToOrderUseCase } from './addProductToOrderUseCase';
import { AddProductToOrderTypeOrmRepository } from './addProductToOrderTypeOrmRepository';

const express = require('express');
const router = express.Router();

router.post('/order/:id/product', async (request: Request, response: Response) => {
    const orderId = parseInt(request.params.id, 10);
    const productId = Number(request.body.productId);
    const quantity = Number(request.body.quantity);

    if (!Number.isInteger(orderId) || !Number.isInteger(productId) || !Number.isInteger(quantity)) {
        return response.status(400).json({ message: 'Parametres invalides' });
    }

    const repository = new AddProductToOrderTypeOrmRepository();
    const useCase = new AddProductToOrderUseCase(repository);

    try {
        await useCase.execute({ orderId, productId, quantity });
    } catch (error) {
        if (error instanceof Error) {
            return response.status(400).json({ message: error.message });
        }

        return response.status(500).json({ message: 'Internal server error' });
    }

    return response.status(200).json();
});

module.exports = router;
