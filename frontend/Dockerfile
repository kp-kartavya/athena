FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Use the React SPA NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Make NGINX runtime directories writable by nginx
RUN mkdir -p /tmp/nginx \
        /var/cache/nginx \
        /var/log/nginx \
    && chown -R nginx:nginx \
        /usr/share/nginx/html \
        /tmp/nginx \
        /var/cache/nginx \
        /var/log/nginx \
    && sed -i 's#^pid .*;#pid /tmp/nginx/nginx.pid;#' /etc/nginx/nginx.conf \
    && sed -i 's#^user .*;#user nginx;#' /etc/nginx/nginx.conf

# Replace the default entrypoint because it tries to modify NGINX
# configuration files at startup, which a non-root container cannot do.
RUN rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh \
          /docker-entrypoint.d/15-local-resolvers.envsh \
          /docker-entrypoint.d/20-envsubst-on-templates.sh \
          /docker-entrypoint.d/30-tune-worker-processes.sh

EXPOSE 80

USER nginx

CMD ["nginx", "-g", "daemon off;"]