FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production || npm install --production

COPY . .

# Create data directory for JSON store
RUN mkdir -p data

EXPOSE 3000

CMD ["node", "server.js"]
