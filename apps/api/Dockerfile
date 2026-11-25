FROM node:24-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS build
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @kamble/api
COPY apps/api apps/api
RUN pnpm --filter @kamble/api exec prisma generate \
  && pnpm --filter @kamble/api build \
  && pnpm --filter @kamble/api deploy --prod /out \
  && cd /out \
  && node_modules/.bin/prisma generate

FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out/package.json ./
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/prisma ./prisma
COPY --from=build /out/dist ./dist
RUN mkdir uploads && chown node:node uploads
USER node
EXPOSE 3001
CMD ["node", "dist/main"]
