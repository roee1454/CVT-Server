FROM node:20

WORKDIR /server

COPY package.json package-lock.json ./

RUN npm install

RUN npm rebuild bcrypt --build-from-soruce

COPY . .

EXPOSE 3000

CMD ["npm", "run" ,"start:dev"]