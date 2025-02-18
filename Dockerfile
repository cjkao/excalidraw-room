FROM node:16

WORKDIR /excalidraw-room

COPY package.json yarn.lock ./
RUN yarn

COPY tsconfig.json ./
COPY src ./src
RUN yarn build
RUN apt-get update
RUN apt-get install libjemalloc-dev -y
ENV LD_PRELOAD="/usr/lib/x86_64-linux-gnu/libjemalloc.so" 
EXPOSE 3002
CMD ["yarn", "start"]
