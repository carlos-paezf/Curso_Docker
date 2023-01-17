FROM --platform=$BUILDPLATFORM node:19.2-alpine3.16

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run test

RUN rm -rf tests && rm -rf node_modules

RUN npm install --prod

CMD [ "npm", "start" ]