import { pgTable, varchar, timestamp, text, integer, foreignKey, doublePrecision, uniqueIndex, boolean, serial, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const orderStatus = pgEnum("OrderStatus", ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'])
export const productType = pgEnum("ProductType", ['BOOK', 'GAME', 'GASTRO', 'GIFT_CARD', 'TOYS', 'CARDS', 'PUZZLE'])


export const prismaMigrations = pgTable("_prisma_migrations", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: timestamp("finished_at", { withTimezone: true, mode: 'string' }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text(),
	rolledBackAt: timestamp("rolled_back_at", { withTimezone: true, mode: 'string' }),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const orderItem = pgTable("OrderItem", {
	id: text().primaryKey().notNull(),
	orderId: text().notNull(),
	productId: text().notNull(),
	quantity: integer().notNull(),
	price: doublePrecision().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [order.id],
			name: "OrderItem_orderId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "OrderItem_productId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const book = pgTable("Book", {
	id: text().primaryKey().notNull(),
	productId: text().notNull(),
	author: text().notNull(),
	isbn: text().notNull(),
	publisher: text().notNull(),
	pageCount: integer().notNull(),
	bookFormat: text().notNull(),
	category: text().notNull(),
	binding: text().notNull(),
	publishedDate: timestamp({ precision: 3, mode: 'string' }).notNull(),
	audioBook: boolean().notNull(),
	audioLength: integer().notNull(),
	audioLanguage: text(),
}, (table) => [
	uniqueIndex("Book_isbn_key").using("btree", table.isbn.asc().nullsLast().op("text_ops")),
	uniqueIndex("Book_productId_key").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "Book_productId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const game = pgTable("Game", {
	id: text().primaryKey().notNull(),
	productId: text().notNull(),
	category: text().notNull(),
	brand: text().notNull(),
	playersMin: integer().notNull(),
	playersMax: integer().notNull(),
	playTimeMinutes: integer().notNull(),
	producer: text().notNull(),
}, (table) => [
	uniqueIndex("Game_productId_key").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "Game_productId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const gastro = pgTable("Gastro", {
	id: text().primaryKey().notNull(),
	productId: text().notNull(),
	producer: text().notNull(),
	category: text().notNull(),
	brand: text().notNull(),
	binding: text().notNull(),
	edition: integer().notNull(),
	weight: integer().notNull(),
}, (table) => [
	uniqueIndex("Gastro_productId_key").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "Gastro_productId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const aggregateRating = pgTable("AggregateRating", {
	id: text().primaryKey().notNull(),
	ratingValue: doublePrecision().notNull(),
	ratingCount: integer().notNull(),
	bestRating: integer().notNull(),
	worstRating: integer().notNull(),
	productId: text().notNull(),
}, (table) => [
	uniqueIndex("AggregateRating_productId_key").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "AggregateRating_productId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const order = pgTable("Order", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	totalAmount: doublePrecision().notNull(),
	status: orderStatus().default('PENDING').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Order_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const user = pgTable("User", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	username: text().notNull(),
	isAdmin: boolean().default(false),
	phoneNumber: text().default(''),
	theme: text().default('light'),
	favorites: text().array().default(["RAY"]),
	cartItems: text().array().default(["RAY"]),
	lastLogin: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	avatarUrl: text().default(''),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp({ precision: 3, mode: 'string' }),
	password: text().default('').notNull(),
}, (table) => [
	uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("User_username_key").using("btree", table.username.asc().nullsLast().op("text_ops")),
]);

export const product = pgTable("Product", {
	id: text().primaryKey().notNull(),
	sku: text().notNull(),
	name: text().notNull(),
	alternativeHeadline: text().notNull(),
	description: text().default('').notNull(),
	price: doublePrecision().default(0).notNull(),
	discount: doublePrecision().default(0).notNull(),
	availableCount: integer().default(0).notNull(),
	isAvailable: boolean().default(true).notNull(),
	productQuality: text("product_quality").default('new').notNull(),
	coverUrl: text(),
	productType: productType().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("Product_sku_key").using("btree", table.sku.asc().nullsLast().op("text_ops")),
]);

export const imageRecord = pgTable("ImageRecord", {
	id: serial().primaryKey().notNull(),
	filename: text().notNull(),
	url: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const giftCard = pgTable("GiftCard", {
	id: text().primaryKey().notNull(),
	productId: text().notNull(),
	price: integer().notNull(),
	priceCurrency: text().notNull(),
}, (table) => [
	uniqueIndex("GiftCard_productId_key").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "GiftCard_productId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const userDetail = pgTable("UserDetail", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	displayName: text(),
	avatarUrl: text(),
	bio: varchar({ length: 255 }),
	preferredLanguage: text().default('en').notNull(),
	isPremium: boolean().default(false).notNull(),
	membershipStart: timestamp({ precision: 3, mode: 'string' }),
	membershipEnd: timestamp({ precision: 3, mode: 'string' }),
	addressLine1: text().notNull(),
	addressLine2: text(),
	city: text().notNull(),
	stateProvince: text(),
	postalCode: text(),
	countryCode: text().notNull(),
	iban: text(),
	bic: text(),
	dateOfBirth: timestamp({ precision: 3, mode: 'string' }),
	taxId: text(),
	lastActiveAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("UserDetail_taxId_key").using("btree", table.taxId.asc().nullsLast().op("text_ops")),
	uniqueIndex("UserDetail_userId_key").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserDetail_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);
