# Backend - Node.js
FROM node:18
WORKDIR /app
COPY . .
COPY package*.json ./
RUN npm install
EXPOSE 5000
CMD ["node", "server.js"]
