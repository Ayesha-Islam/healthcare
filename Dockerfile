# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build Next.js
FROM node:18-alpine AS nextjs-builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./src/db/prisma/schema.prisma

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build:next

# Stage 3: Build Express
FROM node:18-alpine AS express-builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./src/db/prisma/schema.prisma

# Build Express
RUN npm run build:api

# Stage 4: Next.js Runner
FROM node:18-alpine AS nextjs-runner
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=nextjs-builder /app/public ./public
COPY --from=nextjs-builder /app/.next/standalone ./
COPY --from=nextjs-builder /app/.next/static ./.next/static
COPY --from=nextjs-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=nextjs-builder /app/src/db/generated ./src/db/generated

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

# Stage 5: Express Runner
FROM node:18-alpine AS express-runner
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=express-builder /app/dist ./dist
COPY --from=express-builder /app/node_modules ./node_modules
COPY --from=express-builder /app/package.json ./package.json
COPY --from=express-builder /app/src/db/generated ./src/db/generated

USER expressjs

EXPOSE 3001

CMD ["node", "dist/server.js"]