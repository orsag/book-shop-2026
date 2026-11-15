ALTER TABLE "AggregateRating" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "AggregateRating" CASCADE;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "isAdmin" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "phoneNumber" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "theme" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "lastLogin" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "avatarUrl" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "createdAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "password" text DEFAULT '' NOT NULL;