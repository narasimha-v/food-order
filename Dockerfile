FROM node:14-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "yarn", "start" ]
