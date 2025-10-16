# STAGE 1: BUILD

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

RUN npm run build

# STAGE 2: RUN

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["node", "build/server.js"]

