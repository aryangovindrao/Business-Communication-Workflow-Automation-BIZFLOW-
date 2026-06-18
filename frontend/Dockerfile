# ── BizFlow frontend (build + nginx) ─────────────────────────
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Talk to the backend via nginx reverse proxy in production.
ENV VITE_MOCK_MODE=false
ENV VITE_API_BASE_URL=/api
RUN npm run build

# ── Serve with nginx ─────────────────────────────────────────
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
