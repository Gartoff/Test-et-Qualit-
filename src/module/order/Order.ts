import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Product } from '../product/Product';

export type OrderItem = {
    productId: number;
    quantity: number;
    unitPrice: number;
};

export const MIN_ORDER_ITEM_QUANTITY = 1;
export const MAX_ORDER_ITEMS = 5;
export const MAX_ORDER_TOTAL = 2000;

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column('simple-array', { nullable: true, default: '' })
    public productIds: number[];

    @Column({ type: 'jsonb', default: () => "'[]'" })
    public items: OrderItem[];

    @Column({ type: 'float', default: 0 })
    public totalPrice: number;

    @CreateDateColumn()
    public createdAt: Date;

    @Column({
        type: 'varchar',
        length: 50,
        default: OrderStatus.PENDING
    })
    public status: OrderStatus;

    constructor(params?: {
        productIds?: number[];
        items?: OrderItem[];
        totalPrice?: number;
        status?: OrderStatus;
        createdAt?: Date;
    }) {
        this.productIds = params?.productIds ?? [];
        this.items = params?.items ?? [];
        this.totalPrice = params?.totalPrice ?? 0;
        this.status = params?.status ?? OrderStatus.PENDING;
        this.createdAt = params?.createdAt ?? new Date();
    }

    addProduct(product: Product, quantity: number) {
        if (quantity < MIN_ORDER_ITEM_QUANTITY) {
            throw new Error('quantite invalide');
        }

        const currentItems = this.items || [];
        const existingItem = currentItems.find((item) => item.productId === product.id);

        let nextItems: OrderItem[];

        if (existingItem) {
            nextItems = currentItems.map((item) =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        } else {
            if (currentItems.length >= MAX_ORDER_ITEMS) {
                throw new Error('nombre maximum de produits atteint');
            }

            nextItems = [
                ...currentItems,
                { productId: product.id, quantity, unitPrice: product.price }
            ];
        }

        const nextTotalPrice = nextItems.reduce(
            (total, item) => total + item.quantity * item.unitPrice,
            0
        );

        if (nextTotalPrice > MAX_ORDER_TOTAL) {
            throw new Error('montant maximum de la commande depasse');
        }

        this.items = nextItems;
        this.productIds = nextItems.map((item) => item.productId);
        this.totalPrice = nextTotalPrice;
    }
}
