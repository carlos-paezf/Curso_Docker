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
