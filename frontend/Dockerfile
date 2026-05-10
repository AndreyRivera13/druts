# =====================================================
# Stage 1: Dependencias
# =====================================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund

# =====================================================
# Stage 2: Builder
# =====================================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3001}
ENV NEXT_TELEMETRY_DISABLED=1

RUN echo "Building with NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" && npm run build

# =====================================================
# Stage 3: Producción (Next.js standalone)
# =====================================================
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["node", "server.js"]
