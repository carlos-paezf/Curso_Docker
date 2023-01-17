FROM node:19.2-alpine3.16 as dependencies
WORKDIR /app
COPY package.json ./
RUN npm install


FROM node:19.2-alpine3.16 as builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run test


FROM node:19.2-alpine3.16 as prod-dependencies
WORKDIR /app
COPY package.json ./
RUN npm install --prod


FROM node:19.2-alpine3.16 as runner
WORKDIR /app
COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY src/ ./src
COPY package.json ./
CMD [ "npm", "start" ]