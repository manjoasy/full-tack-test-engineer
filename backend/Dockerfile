FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Run as non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001
USER backend

CMD ["node", "dist/server.js"]
