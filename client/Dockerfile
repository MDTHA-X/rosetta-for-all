# client/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose client port (3000)
EXPOSE 3000

ENV PORT=3000
ENV REACT_APP_API_URL=http://localhost:5001/api

CMD ["npm", "start"]
