# refactored from https://milanwittpohl.com/projects/tutorials/Full-Stack-Web-App/dockerizing-our-front-and-backend

FROM node:17-alpine as build

WORKDIR /app

COPY yarn.lock .yarnrc.yml package.json ./
COPY .yarn ./.yarn
COPY shared ./shared
COPY ./frontend/package.json ./frontend/

RUN yarn install

COPY ./frontend ./frontend
RUN yarn run client-build

FROM nginx:1.21.6-alpine
COPY --from=build /app/frontend/build /usr/share/nginx/html
COPY --from=build /app/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 100
CMD ["nginx", "-g", "daemon off;"]