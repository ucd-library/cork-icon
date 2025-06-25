FROM node:22

RUN mkdir /cork-icon
WORKDIR /cork-icon

COPY src src
RUN cd src && npm install
RUN cd src && npm link
ENV NODE_PATH=/usr/local/lib/node_modules/

COPY io io
RUN cd io/font-awesome-6.7 && npm install

COPY app app
RUN cd app/src && npm install
RUN cd app/src && npm link @ucd-lib/cork-icon

CMD ["bash", "-c", "tail -f /dev/null"]
