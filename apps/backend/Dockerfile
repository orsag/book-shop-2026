FROM node:24-alpine3.22
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
# Build the NestJS app (usually outputs to /dist/apps/backend)
RUN npx nx build backend --configuration=production

EXPOSE 3000

# Start command: Migrate, Seed, then Run
CMD npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/backend/main.js
