FROM alpine:edge
RUN echo "http://dl-4.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories 
RUN apk update
RUN apk add --update iojs
RUN apk add --update git

RUN apk update
RUN apk upgrade
RUN rm -rf /var/cache/apk/*

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY . /usr/src/app
RUN npm install -g

COPY ./run.sh /run.sh
RUN chmod +x /run.sh
EXPOSE 9000
CMD /run.sh
