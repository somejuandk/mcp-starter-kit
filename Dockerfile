# ---------- Trin 1: byg (har TypeScript og dev-pakker) ----------
FROM node:22-slim AS build
WORKDIR /app

# Pakkefilerne først, så Docker kan genbruge installationen, når kun koden er ændret
COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc && npm prune --omit=dev

# ---------- Trin 2: kør (kun det nødvendige) ----------
FROM node:22-slim AS runtime
ENV NODE_ENV=production \
    DATA_MAPPE=/data
WORKDIR /app

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

# Kør ikke som root inde i containeren
USER node

# Data er IKKE med i imaget. Du giver containeren en mappe, når du starter den:
#   docker run -i --rm --network none -v "$PWD/data:/data:ro" mcp-starter-kit
CMD ["node", "dist/index.js"]
