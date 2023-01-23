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
