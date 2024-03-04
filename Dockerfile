FROM public.ecr.aws/docker/library/node:20.11-slim

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm install

COPY . /app

CMD ["npm", "run", "start:dev"]
