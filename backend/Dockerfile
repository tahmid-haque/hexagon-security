FROM node:17-alpine as build

WORKDIR /usr/src/app

COPY yarn.lock .yarnrc.yml package.json ./
COPY .yarn ./.yarn
COPY shared ./shared
COPY ./backend/package.json ./backend/

RUN yarn install

COPY ./backend ./backend

EXPOSE 4000

CMD ["yarn", "run", "server"]