FROM node

WORKDIR /usr/app

COPY package.json ./

RUN yarn

COPY . .

EXPOSE 3030

CMD ["npm", "run", "dev"]
