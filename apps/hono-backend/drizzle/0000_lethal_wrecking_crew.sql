-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."OrderStatus" AS ENUM('PENDING', 'PAID', 'SHIPPED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."ProductType" AS ENUM('BOOK', 'GAME', 'GASTRO', 'GIFT_CARD', 'TOYS', 'CARDS', 'PUZZLE');--> statement-breakpoint
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OrderItem" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"productId" text NOT NULL,
	"quantity" integer NOT NULL,
	"price" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Book" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"author" text NOT NULL,
	"isbn" text NOT NULL,
	"publisher" text NOT NULL,
	"pageCount" integer NOT NULL,
	"bookFormat" text NOT NULL,
	"category" text NOT NULL,
	"binding" text NOT NULL,
	"publishedDate" timestamp(3) NOT NULL,
	"audioBook" boolean NOT NULL,
	"audioLength" integer NOT NULL,
	"audioLanguage" text
);
--> statement-breakpoint
CREATE TABLE "Game" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"category" text NOT NULL,
	"brand" text NOT NULL,
	"playersMin" integer NOT NULL,
	"playersMax" integer NOT NULL,
	"playTimeMinutes" integer NOT NULL,
	"producer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Gastro" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"producer" text NOT NULL,
	"category" text NOT NULL,
	"brand" text NOT NULL,
	"binding" text NOT NULL,
	"edition" integer NOT NULL,
	"weight" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AggregateRating" (
	"id" text PRIMARY KEY NOT NULL,
	"ratingValue" double precision NOT NULL,
	"ratingCount" integer NOT NULL,
	"bestRating" integer NOT NULL,
	"worstRating" integer NOT NULL,
	"productId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"isAdmin" boolean DEFAULT false NOT NULL,
	"phoneNumber" text DEFAULT '' NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"favorites" text[] DEFAULT '{"RAY"}',
	"cartItems" text[] DEFAULT '{"RAY"}',
	"lastLogin" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"avatarUrl" text DEFAULT '' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Order" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"totalAmount" double precision NOT NULL,
	"status" "OrderStatus" DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Product" (
	"id" text PRIMARY KEY NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"alternativeHeadline" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" double precision DEFAULT 0 NOT NULL,
	"discount" double precision DEFAULT 0 NOT NULL,
	"availableCount" integer DEFAULT 0 NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL,
	"product_quality" text DEFAULT 'new' NOT NULL,
	"coverUrl" text,
	"productType" "ProductType" NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ImageRecord" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"url" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "GiftCard" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"price" integer NOT NULL,
	"priceCurrency" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserDetail" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"displayName" text,
	"avatarUrl" text,
	"bio" varchar(255),
	"preferredLanguage" text DEFAULT 'en' NOT NULL,
	"isPremium" boolean DEFAULT false NOT NULL,
	"membershipStart" timestamp(3),
	"membershipEnd" timestamp(3),
	"addressLine1" text NOT NULL,
	"addressLine2" text,
	"city" text NOT NULL,
	"stateProvince" text,
	"postalCode" text,
	"countryCode" text NOT NULL,
	"iban" text,
	"bic" text,
	"dateOfBirth" timestamp(3),
	"taxId" text,
	"lastActiveAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Book" ADD CONSTRAINT "Book_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Game" ADD CONSTRAINT "Game_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Gastro" ADD CONSTRAINT "Gastro_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "AggregateRating" ADD CONSTRAINT "AggregateRating_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "UserDetail" ADD CONSTRAINT "UserDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book" USING btree ("isbn" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Book_productId_key" ON "Book" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Game_productId_key" ON "Game" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Gastro_productId_key" ON "Gastro" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "AggregateRating_productId_key" ON "AggregateRating" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_username_key" ON "User" USING btree ("username" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Product_sku_key" ON "Product" USING btree ("sku" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "GiftCard_productId_key" ON "GiftCard" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "UserDetail_taxId_key" ON "UserDetail" USING btree ("taxId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "UserDetail_userId_key" ON "UserDetail" USING btree ("userId" text_ops);
*/