# BookStore2026

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.<br>
✨ Frontend - Angular ✨.<br>
✨ Backend - NestJS ✨.<br>
✨ Backend - Express ✨.<br>
✨ Backend - Hono ✨.<br>


## Docker setup for database
```yaml
services:
  db:
    image: postgres:18.4-alpine3.22
    container_name: devel
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: $USER
      POSTGRES_PASSWORD: $PASSWORD
      POSTGRES_DB: $DB_NAME
    volumes:
      - postgres_data:/var/lib/postgresql

  # Assuming your NestJS service is here
  api:
    build: .
    volumes:
      - .:/usr/src/app
      - upload_data:/usr/src/app/uploads

volumes:
  postgres_data:
  upload_data:
```

## Database setup
```sh
npx prisma migrate dev --name initial
```
```sh
npx prisma generate
```
```sh
npx tsx prisma/seed.ts
```


## Run tasks
```sh
npx nx build frontend --skip-nx-cache 2>&1 | tail -10
```
```sh
npx nx build backend --skip-nx-cache 2>&1 | tail -10
```
```sh
npx nx run frontend:serve:development
```
```sh
npx nx run backend:serve:development
```

## Testing tasks
```sh
npx nx playwright frontend
```
```sh
npx nx test frontend
```
```sh
npx nx run frontend:e2e
```
```sh
npx nx run backend:e2e
```

## Others tasks
```shell
npx nx run frontend:lint --skip-nx-cache 2>&1
```
```shell
rm -rf dist .angular/cache .nx/cache
```
```shell
rm -rf node_modules package-lock.json
```
Pipeline simulation locally!
```shell
gitlab-ci-local
```
