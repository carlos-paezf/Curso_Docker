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
