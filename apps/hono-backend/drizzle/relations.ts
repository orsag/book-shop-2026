import { relations } from "drizzle-orm/relations";
import { product, book, game, gastro, user, order, giftCard, userDetail, orderItem } from "./schema";

export const bookRelations = relations(book, ({one}) => ({
	product: one(product, {
		fields: [book.productId],
		references: [product.id]
	}),
}));

export const productRelations = relations(product, ({many}) => ({
	books: many(book),
	games: many(game),
	gastros: many(gastro),
	giftCards: many(giftCard),
	orderItems: many(orderItem),
}));

export const gameRelations = relations(game, ({one}) => ({
	product: one(product, {
		fields: [game.productId],
		references: [product.id]
	}),
}));

export const gastroRelations = relations(gastro, ({one}) => ({
	product: one(product, {
		fields: [gastro.productId],
		references: [product.id]
	}),
}));

export const orderRelations = relations(order, ({one, many}) => ({
	user: one(user, {
		fields: [order.userId],
		references: [user.id]
	}),
	orderItems: many(orderItem),
}));

export const userRelations = relations(user, ({many}) => ({
	orders: many(order),
	userDetails: many(userDetail),
}));

export const giftCardRelations = relations(giftCard, ({one}) => ({
	product: one(product, {
		fields: [giftCard.productId],
		references: [product.id]
	}),
}));

export const userDetailRelations = relations(userDetail, ({one}) => ({
	user: one(user, {
		fields: [userDetail.userId],
		references: [user.id]
	}),
}));

export const orderItemRelations = relations(orderItem, ({one}) => ({
	order: one(order, {
		fields: [orderItem.orderId],
		references: [order.id]
	}),
	product: one(product, {
		fields: [orderItem.productId],
		references: [product.id]
	}),
}));