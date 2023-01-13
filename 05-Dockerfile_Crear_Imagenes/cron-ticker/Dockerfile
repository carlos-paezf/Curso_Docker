FROM node:19.2-alpine3.16

WORKDIR /app

COPY src/app.js package.json ./

RUN npm install

CMD [ "node", "app.js" ]