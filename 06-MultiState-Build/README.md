# Sección 06: Multi-State Build

En esta sección aprenderemos a realizar lo que se conoce como Multi-Stage Build, el cual no es más que el mismo proceso que vimos anteriormente del Dockerfile, pero en una agrupación de pasos.

Puntualmente veremos:

- Variables de entorno para ambientes
- Stages como:
  - dev
  - dependencies
  - prod-dependencies
  - prod
  - runner
  - builder
  - tester
- Configuraciones adicionales
- Dockerfile + Docker Compose
- Bind mounts en Compose
- Seleccionar un stage específico a ejecutar únicamente
- Docker Compose para producción
- Auto tag en Compose

## Multi-State Build

Para definir una etapa de construcción, hacemos uso de la palabra `as`. Para este ejemplo, vamos a definir una etapa que se dedique a la instalación de las dependencias; otra se encargar de hacer el testing y construcción del build del proyecto, pero necesita copiar el contenido del directorio de `node_modules` de la primera etapa; tenemos otra etapa que se encarga de instalar las dependencias de producción; y una última etapa que se encarga de copiar el directorio `node_modules` de la etapa anterior, y los archivos necesarios para correr el proyecto:

```Dockerfile
FROM node:19.2-alpine3.16 as dependencies
WORKDIR /app
COPY package.json ./
RUN npm install


FROM node:19.2-alpine3.16 as builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run test


FROM node:19.2-alpine3.16 as prod-dependencies
WORKDIR /app
COPY package.json ./
RUN npm install --prod


FROM node:19.2-alpine3.16 as runner
WORKDIR /app
COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY src/ ./src
COPY package.json ./
CMD [ "npm", "start" ]
```

Cuando construimos la imagen, vamos a observar una considerable reducción en el tamaño comparada con las anteriores.

```txt
$: docker image ls
REPOSITORY               TAG               IMAGE ID       CREATED          SIZE
<username>/cron-ticker   latest            a200a5c9a59a   10 minutes ago   193MB
<username>/cron-ticker   stages            a200a5c9a59a   10 minutes ago   193MB
<username>/cron-ticker   struct            60a627d8ce3f   17 hours ago     254MB
<username>/cron-ticker   fox               782bc31d26dd   18 hours ago     256MB
```

Si ejecutamos un contenedor, abrimos su ShellCommand y listamos los directorios, podremos notar que solo tenemos los archivos y módulos que necesitamos:

```txt
$: docker container run -d <username>/cron-ticker:stages
e9cf0dcc9027

$: export MSYS_NO_PATHCONV=1

$: docker container exec -it e9c /bin/sh
/app # ls -a
.             ..            node_modules  package.json  src
/app #
```

Cuando subimos la imagen al repositorio en Docker Hub, observaremos que la imagen comprimida pesa aún menos, en este caso las anteriores imágenes estaban entre los 75 y 76 MB, pero esta última imagen pesa solo 54.6 MB

## Build con otras arquitecturas

Vamos a crear una imagen que este disponible para diversas arquitecturas, para lo cual podemos apoyarnos en la [lección de BuildX de la sección anterior](../05-Dockerfile_Crear_Imagenes/README.md#buildx). Lo primero será asignar la plataforma a las sentencias FROM, aunque este es un paso opcional para cuando tenemos variables de entorno:

```Dockerfile
FROM --platform=$BUILDPLATFORM node:19.2-alpine3.16 as <stage>
```

Y lo siguiente será crear la imagen con el siguiente comando (Para conocer las arquitecturas disponibles podemos inspeccionar el builder en uso con el comando `docker buildx inspect`. Con `--push` podemos enviar la imagen de manera directa al repositorio de Docker Hub):

```txt
$: docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7,linux/riscv64,linux/ppc64le,linux/s390x,linux/386,linux/mips64le -t <username>/cron-ticker:ninja --push .
```

## Docker Compose build - Preparación

Para esta lección vamos a usar el [material adjunto](teslo-shop/), e instalamos las dependencias con el gestor de paquetes preferido (npm, yarn o pnpm), luego, clonamos el archivo `.env.template` y lo renombramos como `.env`. Para levantar la base de datos usamos el comando `docker-compose up -d`. Debemos ejecutar el siguiente comando para levantar la aplicación en modo desarrollo: `pnpm start:dev`. Para ejecutar el seed de datos vamos dentro de un navegador a la dirección `http://localhost:3000/api/seed`, y si ingresamos a `http://localhost:3000/api` veremos una documentación de los endpoints. Una vez comprobado que todo funciona, podemos detener el proyecto, y bajar el contenedor y red con `docker-compose down`.

## Docker Compose - Target State

Dentro del archivo `docker-compose.yml` vamos a añadir un nuevo servicio en el cual creamos un bind volume con el directorio raíz del proyecto, con la dirección `app/` del contenedor, también relacionamos las variables de entorno necesarias.

```yaml
...
services:
    app:
        volumes:
            - .:/app/
        container_name: nest-app
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
    ...
...
```

Si intentamos levantar el archivo con `docker-compose up`, nos vamos a encontrar el siguiente error:

```txt
$: docker compose up
service "app" has neither an image nor a build context specified: invalid compose project
```

Lo anterior se debe a que se debe especificar una imagen para que se pueda levantar el proyecto.

## Ejecutar partes específicas del Dockerfile

Dentro del archivo `Dockerfile` necesitamos añadir una nueva etapa para ejecutar el proyecto en modo desarrollo:

```Dockerfile
FROM node:19-alpine3.15 as dev
WORKDIR /app
COPY package.json ./
RUN yarn install
CMD ["yarn", "start:dev"]
```

Luego, dentro del archivo `docker-compose.yml` definimos el contexto usado para construir la imagen, en este caso es la etapa que acabamos de añadir:

```yaml
...
services:
    app:
        build:
            context: .
            dockerfile: Dockerfile
            target: dev
        ...
    ...
...
```

Ahora si podemos usar el comando para levantar del docker-compose, mediante el cual se hace la construcción de la primera etapa del Dockerfile. El nuevo inconveniente es que no reconoce la conexión con la base de datos, para solucionar esto debemos ir al archivo `.env` y modificar el host de la base de datos:

```.env
DB_HOST=TesloDB
```

Luego hacemos una pequeña modificación al stage dedicado al desarrollo, en donde vamos a quitar el comando para delegarle dicha función al servicio en el docker-compose:

```Dockerfile
FROM node:19-alpine3.15 as dev
WORKDIR /app
COPY package.json ./
RUN yarn install
# CMD ["yarn", "start:dev"]
```

```yaml
...
services:
    app:
        build:
            context: .
            dockerfile: Dockerfile
            target: dev
        command: yarn start:dev
        ...
    ...
...
```

Por seguridad vamos a usar el comando `docker-compose down --volumes` para bajar el docker compose y los volumes creados por su proceso. Ejecutamos `docker-compose build` y `docker-compose up` y podremos observar que nuestro proyecto comienza a ejecutarse de manera correcta.

Algunas personas prefieren tener dos archivos de Dockerfile separados, esto con el fin de dedicar stages solo para desarrollo y otros solo para producción.
