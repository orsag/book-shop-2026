# Stage 1: Build
FROM node:24-alpine3.22 AS build
WORKDIR /app
COPY package*.json ./
# Since scripts are empty, we install and run nx directly
RUN npm install
COPY . .
RUN npx nx build frontend --configuration=production

# RUN ls -R /app/dist
# Stage 2: Serve
FROM nginx:alpine
# Copy the built browser files to Nginx's html folder
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
# Copy your specific frontend nginx config (for SPA routing)
# If building from root, use: COPY frontend/nginx.conf ...
# If building from within /frontend, use: COPY nginx.conf ...
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
