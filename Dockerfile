# Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_FRONTEND_URL=http://localhost:8000
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
RUN npm run build

# Run
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY server.js ./

EXPOSE 8000

CMD ["node", "server.js"]
