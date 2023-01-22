# Sección 07: Deployments y Registros

## Construcción de imagen, múltiples arquitecturas

Vamos a usar el ejercicio de `teslo-shop` de la sección anterior. Lo primero que haremos es crear un repositorio en Docker Hub en el cual subiremos la imagen que vamos a generar, luego vamos a usar BuildX para construir la imagen en múltiples arquitecturas:

```txt
$: docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t <username>/teslo-shop:1.0.0 --push .
```

Recordar que dentro del archivo Dockerfile debemos especificar la variable de platform `FROM --platform=$BUILDPLATFORM`.

Puede que se demore un poco más de lo normal debido a la cantidad de arquitecturas que se especifiquen, y del tamaño del proyecto. Otro aspecto que debemos tener en cuenta, es que podemos personalizar mediante lenguaje Markdown la descripción del repositorio en Docker Hub. Por ejemplo mediante una tabla se pueden mostrar mediante clave-valor las variables de entorno que se deben definir en nuestra imagen.

## Prueba de la imagen creada

Vamos a probar nuestra imagen, por lo que creamos un nuevo directorio que contenga solo el archivo de variables de entorno, y un `docker-compose.yaml` para indicar los servicios de la api y de la base de datos. En este caso indicamos que el servicio de app sea descargado de nuestro repositorio en Docker Hub, que dependa del servicio de la base de datos, y que siempre se recargue en caso de errores:

```yaml
version: '3'

services:
    app:
        image: <username>/teslo-shop:1.0.0
        depends_on:
            - db
        restart: always
        container_name: teslo-backend
        ports:
            - ${PORT}:${PORT}
        environment:
            APP_VERSION: ${APP_VERSION}
            STAGE: ${STAGE}
            DB_PASSWORD: ${DB_PASSWORD}
            DB_NAME: ${DB_NAME}
            DB_HOST: ${DB_HOST}
            DB_PORT: ${DB_PORT}
            DB_USERNAME: ${DB_USERNAME}
            PORT: ${PORT}
            HOST_API: ${HOST_API}
            JWT_SECRET: ${JWT_SECRET}
    db:
        image: postgres:14.3
        restart: always
        ports:
            - "5432:5432"
        environment:
            POSTGRES_PASSWORD: ${DB_PASSWORD}
            POSTGRES_DB: ${DB_NAME}
        container_name: ${DB_NAME}
        volumes:
            - postgres-db:/var/lib/postgresql/data

volumes:
    postgres-db:
        external: false
```

Con lo anterior listo, pasamos a probar usando el comando de:

```txt
$: docker-compose up
```
