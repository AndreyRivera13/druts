# =====================================================
# Stage 1: Builder — compila TypeScript y módulos nativos
# =====================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Toolchain necesario para compilar bcrypt y sharp en Alpine
RUN apk add --no-cache python3 make g++ vips-dev

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# =====================================================
# Stage 2: Producción — imagen final liviana
# =====================================================
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# libvips en runtime para sharp
RUN apk add --no-cache vips

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

RUN mkdir -p uploads && chown -R node:node /app
USER node

EXPOSE 3001
CMD ["node", "dist/main"]
