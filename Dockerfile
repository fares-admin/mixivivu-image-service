FROM node:lts as dependencies
WORKDIR /image-service
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:lts as builder
WORKDIR /image-service
COPY . .
COPY --from=dependencies /image-service/node_modules ./node_modules
RUN yarn build

FROM node:lts as runner
WORKDIR /image-service
ENV NODE_ENV production
# If you are using a custom next.config.js file, uncomment this line.
COPY --from=builder /image-service/next.config.js ./
COPY --from=builder /image-service/public ./public
COPY --from=builder /image-service/.next ./.next
COPY --from=builder /image-service/node_modules ./node_modules
COPY --from=builder /image-service/package.json ./package.json

ENV DATABASE_URL=${DATABASE_URL}

EXPOSE 3005
CMD ["yarn", "start"]
