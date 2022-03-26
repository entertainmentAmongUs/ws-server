FROM node:16 AS builder
WORKDIR /usr/app
COPY . .
RUN yarn
RUN yarn build

FROM node:16
WORKDIR /usr/app
COPY . .
COPY --from=builder /usr/app/dist ./dist
RUN yarn install --prod
RUN yarn global add pm2

EXPOSE 8080

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
