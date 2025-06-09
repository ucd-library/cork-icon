FROM node:22

RUN mkdir /cork-icon
WORKDIR /cork-icon

COPY src src
RUN cd src && npm install

COPY io io
RUN cd io/font-awesome-6.7 && npm install

COPY app app

CMD ["bash", "-c", "tail -f /dev/null"]
