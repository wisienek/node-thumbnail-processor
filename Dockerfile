FROM node:20.12-alpine AS builder

WORKDIR /usr/app

COPY ./package.json ./yarn.lock ./

COPY ./data ./

ENV npm_config_build_from_source=true \
    npm_config_shared_gdal=true

RUN yarn install --frozen-lockfile --production=true

COPY ./dist .

###############################################################

FROM node:20.12-alpine AS serve

ENV NO_COLOR=true
ENV NODE_ENV=production

COPY --from=builder /usr/app/ ./

RUN echo "web: node main.js" > Procfile

ENTRYPOINT ["node", "main.js"]
