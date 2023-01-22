FROM --platform=$BUILDPLATFORM node:19-alpine3.15 as dev
WORKDIR /app
COPY package.json ./
RUN yarn install
CMD [ "yarn", "start:dev" ]



FROM --platform=$BUILDPLATFORM node:19-alpine3.15 as dev-deps
WORKDIR /app
COPY package.json package.json
RUN yarn install --frozen-lockfile


FROM --platform=$BUILDPLATFORM node:19-alpine3.15 as builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
# RUN yarn test
RUN yarn build

FROM --platform=$BUILDPLATFORM node:19-alpine3.15 as prod-deps
WORKDIR /app
COPY package.json package.json
RUN yarn install --omit=dev --frozen-lockfile


FROM --platform=$BUILDPLATFORM node:19-alpine3.15 as prod
EXPOSE 3000
WORKDIR /app
ENV APP_VERSION=${APP_VERSION}
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD [ "node","dist/main.js"]
