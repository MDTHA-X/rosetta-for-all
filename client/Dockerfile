# client/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 80

ENV PORT=80
ENV REACT_APP_API_URL=http://localhost:5001/api

CMD ["node", "server.js"]
