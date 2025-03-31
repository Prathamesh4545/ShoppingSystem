# Stage 1: Build
FROM node:22.13.1-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22.13.1-alpine
WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json .

# Install production dependencies including Vite
RUN npm install --only=production vite @vitejs/plugin-react

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:4173 || exit 1

EXPOSE 4173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0"]