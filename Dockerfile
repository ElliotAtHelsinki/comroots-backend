FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .
COPY .env.production .env

RUN yarn set version berry
RUN echo "nodeLinker: node-modules" >> .yarnrc.yml
RUN yarn install

ENV NODE_ENV production

EXPOSE 4000
CMD [ "yarn", "start" ]