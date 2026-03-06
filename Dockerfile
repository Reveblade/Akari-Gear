# Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_ADMIN_URL=http://localhost:8001
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL
RUN npm run build

# Run
FROM node:20-alpine

WORKDIR /app

ARG BACKEND_URL=http://backend:3000
ENV BACKEND_URL=$BACKEND_URL

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY server.js ./

EXPOSE 8080

CMD ["node", "server.js"]
