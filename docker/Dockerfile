FROM node:5

RUN mkdir -p /root/.ssh \
 && ssh-keyscan -t rsa github.com > /root/.ssh/known_hosts

RUN mkdir /app

WORKDIR /app
