# Sección 09: NGINX

Esta sección está dedicada a trabajar con NGINX server, el cual es la imagen más descargada de docker hub.

Puntualmente veremos:

- ¿Qué es brevemente NGINX?
- Inspeccionar el file system de NGINX
- Crear imágenes basadas en NGINX
- Desplegar una aplicación de React en NGINX
- Desplegar un SPA (Single Page Application)
- Configurar NGINX para designar el router de React como controlador de rutas

Es una sección muy importante e interesante si quieres tener tu aplicación web desplegada en un servidor robusto y seguro.

## Inicio de proyecto - SPA Nginx

Para esta sección vamos a usar el [proyecto adjunto](react-heroes/), es cual es un proyecto de React. Para descargar las dependencias, podemos usar el gestor de paquetes que deseemos. Para levantar el proyecto usamos el comando `npm run dev`.

Nginx es un servidor web que también se puede utilizar como proxy inverso, balanceador de carga, proxy de correo y caché HTTP. El software fue creado por Igor Sysoev y lanzado al público en 2004. Nginx es un software gratuito y de código abierto.

Vamos a generar el directorio de distribución del proyecto con el comando `npm run build`.

## Nginx - DockerHub

Vamos a correr un contenedor con Nginx en su versión de 1.23.3, para ello usamos el siguiente comando:

```txt
$: docker run --name nginx -dp 8080:80 nginx:1.23.3
```

Si abrimos la dirección `localhost:8080` podemos observar la bienvenida por parte de Nginx.

## Inspeccionar Nginx

Con el contenedor de la lección anterior, vamos realizar un inspect del mismo, por lo que usamos el comando:

```txt
$: docker exec -it <id> bash
```

Luego, dentro de la consola interactiva podemos revisar un directorio que contiene algunos archivo html con el siguiente comando:

```txt
$: cd usr/share/nginx/html
```

## Construir la imagen de nuestra aplicación

Para construir nuestra imagen debemos contar con la carpeta `dist`, luego creamos el archivo `.dockerignore` en el cual añadimos los siguientes directorios y archivos:

```.dockerignore
node_modules/
.git
dist
```

Luego, creamos el archivo `Dockerfile` en el que tendremos la siguiente configuración:

```Dockerfile
FROM node:19-alpine3.15 as dev-deps
WORKDIR /app
COPY package.json package.json
RUN yarn install --frozen-lockfile


FROM node:19-alpine3.15 as builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN yarn test
RUN yarn build


FROM nginx:1.23.3 as prod
EXPOSE 80
COPY --from=builder /app/dist /usr/share/nginx/html
CMD [ "nginx", "-g", "daemon off;" ]
```

Cuando levantamos la imagen, con el comando a continuación, vamos a observar que se van ejecutando las diversas fases y etapas internas.

```txt
$: docker build -t <username>/react-nginx:1.0.0 . --no-cache
```

Lo siguiente será levantar un contenedor con la imagen:

```txt
$: docker run --name heroes-react-nginx -dp 80:80 <username>/react-nginx:1.0.0
```

Cuando ingresamos a `localhost`, observamos la aplicación, pero las imágenes no se podrán ver, la configuración para que aparezcan lo veremos en una próxima lección. Otro "problema", es que las rutas cuando se recarga la aplicación, se rompen, y eso se debe a la incompatibilidad entre el router propio de react, con el router de nginx.

## nginx config

Como la aplicación es un SPA, las urls están siendo gestionadas por la misma aplicación, por lo que debemos empatarla con NGINX, para ello vamos a abrir una terminal interactiva del contenedor y dirigirnos a un path en especifico:

```txt
$: docker exec -it <id> bash

root@<id>:/# cd etc/nginx/conf.d

root@<id>:/# cat default.conf
```

El contenido de dicho archivo lo copiamos y luego lo pegamos en nuestro proyecto local en el archivo `nginx/nginx.conf`:

```conf
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    # proxy the PHP scripts to Apache listening on 127.0.0.1:80
    #
    #location ~ \.php$ {
    #    proxy_pass   http://127.0.0.1;
    #}

    # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
    #
    #location ~ \.php$ {
    #    root           html;
    #    fastcgi_pass   127.0.0.1:9000;
    #    fastcgi_index  index.php;
    #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
    #    include        fastcgi_params;
    #}

    # deny access to .htaccess files, if Apache's document root
    # concurs with nginx's one
    #
    #location ~ /\.ht {
    #    deny  all;
    #}
}
```

Luego vamos a aplicar una configuración dentro de la sección de location, con la intención de indicarle que no importa la ruta, sea gestionada por el archivo `index.html`, el cual es el archivo que copiamos en el step `prod` dentro del Dockerfile:

```conf
server {
    ...
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    ...
}
```

Lo que estamos haciendo sería muy tedioso si lo tuviéramos que hacer cada creamos una imagen de nuestro proyecto, por lo tanto dentro del mismo archivo Dockerfile, nos vamos a encargar de enviarle por defecto la nueva configuración con el archivo que creamos en nuestro local:

```Dockerfile
...
FROM nginx:1.23.3 as prod
EXPOSE 80
COPY --from=builder /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
CMD [ "nginx", "-g", "daemon off;" ]
```

Cuando levantamos la nueva imagen, y creamos un contenedor con la misma, podremos observar que las rutas ya no generan problema, y sin importar en donde estemos o que parámetros usemos, si recargamos la página, todo se mantendrá estable. El único inconveniente es que seguimos sin ver las imágenes.
