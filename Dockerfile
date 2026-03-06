# Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_FRONTEND_URL=http://localhost:4000
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
RUN npm run build

# Serve
FROM nginx:alpine

RUN apk add --no-cache gettext-envsubst

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 8080

ENTRYPOINT ["/entrypoint.sh"]
