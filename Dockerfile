FROM node:18-bullseye-slim

WORKDIR /app

# Install production dependencies only. We will build TypeScript locally
# and copy `dist/` into the image to avoid building inside the container
# (some host/CPU combinations trigger V8/native failures during build).
COPY package*.json ./
ENV NODE_ENV=production
RUN npm install --legacy-peer-deps --omit=dev

# Copy prebuilt app
COPY dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]