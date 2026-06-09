# syntax=docker/dockerfile:1

# --- deps: production dependencies only (cached layer) ---
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- build: all dependencies + compile TypeScript ---
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- runner: lean production runtime ---
FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
USER node
EXPOSE 3000
# dumb-init as PID 1 so SIGTERM reaches Node for graceful shutdown.
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
