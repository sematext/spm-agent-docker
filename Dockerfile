FROM mhart/alpine-node:4
RUN apk update
RUN apk add --update procps
RUN apk add --update git
RUN apk add --update curl
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
