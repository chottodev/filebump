FROM node:20.10.0

RUN apt-get update \
    && apt-get install -y ffmpeg \
    && apt-get clean

ARG NODE_ENV

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/

RUN npm set registry http://npm.services.mobilon.ru

RUN npm install

COPY . /usr/src/app

RUN npm run build