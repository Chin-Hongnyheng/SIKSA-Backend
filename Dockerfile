FROM node:20-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN NODE_OPTIONS="--max-old-space-size=4096" npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:prod"]