# Stage 1: Build the React Frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy source code and build frontend
COPY . .
RUN npm run build

# Stage 2: Production Server Runner
FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy built frontend assets and server files from builder stage
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Create data directory for JSON store
RUN mkdir -p data

EXPOSE 3000

CMD ["node", "server.js"]