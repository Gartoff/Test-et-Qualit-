import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { Express } from 'express';
import { Product } from '../../../product/Product';
import { Order } from '../../Order';
import { buildApp } from '../../../../config/app';

describe('US-2 : Ajouter un produit a une commande - E2E', () => {
    let container: StartedPostgreSqlContainer;
    let dataSource: DataSource;
    let app: Express;

    beforeAll(async () => {
        container = await new PostgreSqlContainer('postgres:16').withExposedPorts(5432).start();

        dataSource = new DataSource({
            type: 'postgres',
            host: container.getHost(),
            port: container.getPort(),
            username: container.getUsername(),
            password: container.getPassword(),
            database: container.getDatabase(),
            logging: false,
            entities: [Product, Order],
            synchronize: true,
            entitySkipConstructor: true
        });

        await dataSource.initialize();

        const AppDataSource = require('../../../../config/db.config').default;
        app = buildApp();
        Object.assign(AppDataSource, dataSource);
    });

    afterAll(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
        if (container) {
            await container.stop();
        }
    });

    test("Scenario 1 : ajout reussi, le produit n'existe pas dans la commande", async () => {
        await dataSource.getRepository(Product).clear();
        await dataSource.getRepository(Order).clear();

        const product = await dataSource.getRepository(Product).save(
            new Product({
                title: 'switch 2',
                description: 'nouvelle console',
                price: 500
            })
        );

        const order = await dataSource.getRepository(Order).save(new Order());

        const response = await request(app)
            .post(`/api/order/${order.id}/product`)
            .send({ productId: product.id, quantity: 1 })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(200);
        const savedOrder = await dataSource.getRepository(Order).findOneBy({ id: order.id });
        expect(savedOrder?.items).toHaveLength(1);
        expect(savedOrder?.items[0]).toMatchObject({ productId: product.id, quantity: 1 });
        expect(savedOrder?.totalPrice).toBeCloseTo(500);
    });

    test('Scenario 2 : ajout reussi, le produit existe deja dans la commande', async () => {
        await dataSource.getRepository(Product).clear();
        await dataSource.getRepository(Order).clear();

        const product = await dataSource.getRepository(Product).save(
            new Product({
                title: 'switch 2',
                description: 'nouvelle console',
                price: 100
            })
        );

        const order = new Order({
            items: [{ productId: product.id, quantity: 2, unitPrice: product.price }],
            totalPrice: 200
        });
        const savedOrder = await dataSource.getRepository(Order).save(order);

        const response = await request(app)
            .post(`/api/order/${savedOrder.id}/product`)
            .send({ productId: product.id, quantity: 1 })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(200);
        const updatedOrder = await dataSource.getRepository(Order).findOneBy({ id: savedOrder.id });
        expect(updatedOrder?.items[0].quantity).toBe(3);
        expect(updatedOrder?.totalPrice).toBeCloseTo(300);
    });

    test('Scenario 3 : ajout echoue, depassement du nombre maximum de produits', async () => {
        await dataSource.getRepository(Product).clear();
        await dataSource.getRepository(Order).clear();

        const newProduct = await dataSource.getRepository(Product).save(
            new Product({
                title: 'nouveau produit',
                description: 'produit',
                price: 20
            })
        );

        const order = new Order({
            items: [
                { productId: 1, quantity: 1, unitPrice: 10 },
                { productId: 2, quantity: 1, unitPrice: 10 },
                { productId: 3, quantity: 1, unitPrice: 10 },
                { productId: 4, quantity: 1, unitPrice: 10 },
                { productId: 5, quantity: 1, unitPrice: 10 }
            ],
            totalPrice: 50
        });
        const savedOrder = await dataSource.getRepository(Order).save(order);

        const response = await request(app)
            .post(`/api/order/${savedOrder.id}/product`)
            .send({ productId: newProduct.id, quantity: 1 })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('nombre maximum de produits atteint');
    });

    test('Scenario 4 : ajout echoue, depassement du montant maximum de la commande', async () => {
        await dataSource.getRepository(Product).clear();
        await dataSource.getRepository(Order).clear();

        const expensiveProduct = await dataSource.getRepository(Product).save(
            new Product({
                title: 'produit cher',
                description: 'produit cher',
                price: 200
            })
        );

        const order = new Order({
            items: [{ productId: 1, quantity: 19, unitPrice: 100 }],
            totalPrice: 1900
        });
        const savedOrder = await dataSource.getRepository(Order).save(order);

        const response = await request(app)
            .post(`/api/order/${savedOrder.id}/product`)
            .send({ productId: expensiveProduct.id, quantity: 1 })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('montant maximum de la commande depasse');
    });
});
