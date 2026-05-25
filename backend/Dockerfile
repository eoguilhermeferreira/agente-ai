FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

RUN npm prune --production

COPY src ./src

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
