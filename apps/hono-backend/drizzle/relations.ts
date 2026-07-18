import { relations } from "drizzle-orm/relations";
import { order, orderItem, product, book, game, gastro, aggregateRating, user, giftCard, userDetail } from "./schema";

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

export const orderRelations = relations(order, ({one, many}) => ({
	orderItems: many(orderItem),
	user: one(user, {
		fields: [order.userId],
		references: [user.id]
	}),
}));

export const productRelations = relations(product, ({many}) => ({
	orderItems: many(orderItem),
	books: many(book),
	games: many(game),
	gastros: many(gastro),
	aggregateRatings: many(aggregateRating),
	giftCards: many(giftCard),
}));

export const bookRelations = relations(book, ({one}) => ({
	product: one(product, {
		fields: [book.productId],
		references: [product.id]
	}),
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

export const aggregateRatingRelations = relations(aggregateRating, ({one}) => ({
	product: one(product, {
		fields: [aggregateRating.productId],
		references: [product.id]
	}),
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