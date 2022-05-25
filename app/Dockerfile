# FOR DEV ENVIRONMENT
FROM node
WORKDIR /home/node/app
# handled in compose with vol for dynamic remounts
# COPY ./app /home/node/app
RUN npm install npm@latest -g
# for hot reloading on save
RUN npm install nodemon -g
ADD ./src/package.json ./
RUN npm install
CMD npm run hotapp