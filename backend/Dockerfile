FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev

RUN npx prisma generate

COPY src ./src

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node src/server.js"]
