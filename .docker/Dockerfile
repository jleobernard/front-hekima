FROM nginx:1.21.6-alpine
COPY build/ /usr/share/nginx/html
COPY .docker/notes.jleo.tech.conf /etc/nginx/conf.d/notes.jleo.tech.conf
VOLUME /kosubs
