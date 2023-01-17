# Sección 05: Dockerfile - Crear imágenes

Esta sección es sumamente importante para la comprensión y creación de imágenes personalizadas.

Aquí veremos:

- Dockerfile
- .dockerignore
- Principales comandos del Dockerfile:
  - FROM
  - RUN
  - COPY
  - WORKDIR
  - Entre otros
- Asignar tags
- Build
- Buildx (Para múltiples arquitecturas)

Es una sección indispensable para poder crear de forma eficiente nuestras futuras imágenes que desplegaremos en servidores con arquitecturas diferentes a la nuestra computadora.

## Cron-Ticker - Aplicación Simple

Dockerizar una aplicación es el proceso de tomar un código fuente y generar una imagen lista para montar y correrla en un contenedor, para ello se hace uso de un archivo llamado `Dockerfile`. Cada paso dentro del dicho archivo genera un layer en la imagen. Vamos a crear un directorio llamado `cron-ticker` y abrimos una instancia de la terminal en ese directorio, posteriormente inicializamos un proyecto de NodeJS con el siguiente comando:

```txt
$: npm init -y
```

Lo siguiente es crear un archivo `app.js` con una impresión en consola y luego definir un script en el `package.json` para iniciar la aplicación:

```json
{
    ...,
    "scripts": {
        ...,
        "start": "node src/app.js"
    },
    ...
}
```

Lo siguiente será instalar una dependencia llamada Node Cron, y lo hacemos con el siguiente comando:

```txt
$: pnpm install node-cron
```

Seguido a esto copiamos el siguiente código dentro de `app.js`, lo cual va a ejecutar una impresión en consola cada segundo:

```js
const cron = require('node-cron')

cron.schedule('1-59 * * * * *', () => {
    console.count('running a task every second')
})
```

Si por ejemplo queremos que se ejecute cada 5 segundos debemos divider la expresión `1-59` entre 5:

```js
const cron = require('node-cron')

cron.schedule('1-59/5 * * * * *', () => {
    console.count('running a task')
})
```

## Dockerfile - primeros pasos

Vamos a crear el archivo `Dockerfile` dentro del directorio del proyecto, con el fin de definir las instrucciones para crear una imagen de nuestro proyecto. Toda nuestra aplicación necesita empezar por un punto, por lo tanto vamos a usar la versión 19.2-alpine3.16 de NodeJS. El archivo se construirá de la siguiente manera:

1. Dentro del archivo Dockerfile añadimos la instrucción `FROM` para definir la imagen:

   ```Dockerfile
   FROM node:19.2-alpine3.16
   ```

2. Definimos luego el directorio de trabajo en la carpeta `/app`:

   ```Dockerfile
   WORKDIR /app
   ```

3. Le damos la instrucción de cuales archivos se deben copiar, y el directorio en que debe guardarlos (cómo en el paso anterior definimos el directorio de trabajo, le vamos a indicar que se quede en el mismo):

   ```Dockerfile
   COPY src/app.js package.json ./
   ```

Las anteriores instrucciones son las más usadas dentro de las construcción de imágenes de proyectos. En la próxima lección vamos a ver los pasos siguientes y la manera de construir la imagen.

## Construir la imagen - Build

Ya definimos la imagen, el directorio sobre el que vamos a trabajar, y los archivo iniciales de la imagen. Solo nos restan 2 pasos básicos:

1. Ejecutar un comando para descargar las dependencias:

   ```Dockerfile
   RUN npm install
   ```

2. Definir el comando para levantar el proyecto:

   ```Dockerfile
   CMD [ "node", "src/app.js" ]
   ```

Para construir la imagen vamos a usar el siguiente comando (el `.` hace referencia al directorio actual, por lo tanto este comando se debe ejecutar en el lugar donde se tiene el dockerfile, de lo contrario se debe enviar la ruta absoluta):

```txt
$: docker build --tag cron-ticker .
```

Cuando se construye por primera vez la imagen puede ser un poco demorado, cuando se genera una nueva versión, solo validara las instrucciones qu hayan cambiado con la intención de generar nuevos layers, por ello es recomendable que siempre se definan en la parte superior los comandos que no se modifican a menudo ya que una vez detectado un cambio, los demás layers van a cambiar si o si.

Una vez construida la imagen, podremos ejecutar un contenedor para usarla:

```txt
$: docker container run cron-ticker
```

Podemos consultar el peso de la imagen cuando la listamos:

```txt
$: docker image ls
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
cron-ticker   latest    9819877b548f   2 minutes ago   173MB
```

## Reconstruir una imagen

En ocasiones requerimos reconstruir una imagen, ya sea por errores o por actualizaciones. Lo único que debemos hacer es volver a usar el comando de construcción. Por ejemplo vamos a actualizar nuestro archivo Dockerfile al siguiente orden:

```dockerfile
FROM node:19.2-alpine3.16

WORKDIR /app

COPY package.json ./

RUN npm install

COPY src/app.js ./

CMD [ "node", "app.js" ]
```

Los pasos que no presentan cambios quedan en cache, por lo tanto solo los pasos que se modifican y sus siguientes crearán nuevas capas en la imagen.

Podemos definir la versión de la imagen que se va a crear y que no quede sin identificarse. Por ejemplo, si usamos el comando a continuación, vamos a crear la versión 1.0 de la imagen y en ese momento a su vez será la versión latest:

```txt
$: docker build -t cron-ticker:1.0.0 .

$: docker image ls
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
cron-ticker   1.0.0     fa423894d3df   9 seconds ago   173MB
```

Si añadimos un cambio y deseamos volver a actualizar la imagen, ejecutamos el siguiente comando y veremos que convertimos esta nueva versión en la latest:

```txt
$: docker build -t cron-ticker:1.0.1 .

$: docker image ls
REPOSITORY    TAG       IMAGE ID       CREATED          SIZE
cron-ticker   1.0.1     fa423894d3df   3 minutes ago    173MB
cron-ticker   1.0.0     9819877b548f   28 minutes ago   173MB
```

Si queremos actualizar el tag de una imagen usamos el siguiente comando:

```txt
$: docker image tag cron-ticker:1.0.1 cron-ticker:boom

$: docker image ls
REPOSITORY    TAG       IMAGE ID       CREATED          SIZE
cron-ticker   1.0.1     fa423894d3df   5 minutes ago    173MB
cron-ticker   boom      fa423894d3df   5 minutes ago    173MB
cron-ticker   1.0.0     9819877b548f   31 minutes ago   173MB
```

Otro ejemplo es en el caso que construyamos una imagen sin tag, pero que no tenga diferencias con la anterior. Se va a crear una versión con el tag `latest`:

```txt
$: docker build cron-ticker:1.0.2 .

$: docker build cron-ticker .

$: docker image ls
REPOSITORY    TAG       IMAGE ID       CREATED          SIZE
cron-ticker   1.0.2     5553c2b0914a   31 seconds ago   173MB
cron-ticker   latest    5553c2b0914a   31 seconds ago   173MB
cron-ticker   1.0.1     fa423894d3df   6 minutes ago    173MB
cron-ticker   boom      fa423894d3df   6 minutes ago    173MB
cron-ticker   1.0.0     9819877b548f   32 minutes ago   173MB
```

Para ejecutar una imagen en una versión especifica, construimos el contenedor definiendo la imagen como `cron-ticker:<version>`, sino se define se hará uso de la latest.

## Subir imagen a Docker Hub

En esta lección vamos a subir la imagen que creamos en Docker Hub. Para ello necesitamos tener una cuenta en dicha plataforma, y luego podemos pasar a una instancia de terminal para ejecutar el siguiente comando:

```txt
$: docker login
```

Regresamos a la plataforma de Docker Hub y creamos un nuevo repositorio, el cual nos dará un comando para subir la imagen con la siguiente estructura:

```txt
$: docker push <username>/<repositoryName>:<tagName>
```

Debemos crear un nuevo tag de nuestra imagen que tenga el mismo nombre del repositorio:

```txt
$: docker tag <image>:<tagName> <repositoryName>:<tagName>
```

Ahora subimos nuestra imagen:

```txt
$: docker image ls
REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
cron-ticker   blast     5553c2b0914a   25 hours ago   173MB
cron-ticker   latest    5553c2b0914a   25 hours ago   173MB

$: docker tag cron-ticker:blast <username>/cron-ticker:blast

$: docker image ls
REPOSITORY                TAG       IMAGE ID       CREATED        SIZE
<username>/cron-ticker    blast     5553c2b0914a   25 hours ago   173MB
cron-ticker               blast     5553c2b0914a   25 hours ago   173MB
cron-ticker               latest    5553c2b0914a   25 hours ago   173MB

$: docker push <username>/cron-ticker:blast
```

## Consumir nuestra imagen de DockerHub

Un apunte adicional a la lección anterior, es que siempre es recomendable por buena práctica subir de últimas la versión `latest` de la imagen, similar a cómo lo hacen las imágenes oficiales en Docker Hub:

```txt
$: docker image ls
REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
cron-ticker   blast     5553c2b0914a   25 hours ago   173MB
cron-ticker   latest    5553c2b0914a   25 hours ago   173MB

$: docker tag cron-ticker <username>/cron-ticker

$: docker tag cron-ticker:blast <username>/cron-ticker:blast

$: docker image ls
REPOSITORY                TAG       IMAGE ID       CREATED        SIZE
<username>/cron-ticker    blast     5553c2b0914a   25 hours ago   173MB
<username>/cron-ticker    latest    5553c2b0914a   25 hours ago   173MB
cron-ticker               blast     5553c2b0914a   25 hours ago   173MB
cron-ticker               latest    5553c2b0914a   25 hours ago   173MB

$: docker push <username>/cron-ticker:blast

$: docker push <username>/cron-ticker:latest
```

Ahora si vamos al punto central de esta imagen. Vamos a limpiar todas las imágenes que no están siendo usadas en nuestro equipo:

```txt
$: docker image prune -a
```

Haremos la prueba con una de las versiones subidas al repositorio de DockerHub. La primera acción que debe ejecutar el comando, es la descarga de la imagen ya que no la encuentra en local:

```txt
$: docker container run <username>/cron-ticker:blast
```

## Añadir pruebas automáticas

Las pruebas son una de las partes más importantes del desarrollo de un proyecto. Para la aplicación que estamos usando vamos a instalar `jest` con el siguiente comando:

```txt
$: pnpm i jest
```

Lo primero será organizar un poco el código creando la función que se ejecutará dentro del `cron.schedule`, y dicha función será guardada en el archivo `tasks/sync-db.js`:

```js
let ticks = 0

const syncDB = () => {
    console.count('running a task')
    ticks++
    return ticks
}

module.exports = { syncDB }
```

```js
const cron = require('node-cron')
const { syncDB } = require('../tasks/sync-db')

cron.schedule('1-59/3 * * * * *', syncDB)
```

Lo siguiente es crear un archivo para realizar el o los test de la función. En este caso queremos comprobar que el método retorne el número 2:

```js
const { syncDB } = require("../tasks/sync-db")


describe('Pruebas en syncDB', () => {
    test('Debe ejecutar el proceso 2 veces', () => {
        const times = syncDB()
        expect(times).toBe(2)
    })
})
```

Para ejecutar las pruebas debemos añadir el script dentro del `package.json`:

```json
{
    ...,
    "scripts": {
        "test": "jest",
        ...
    },
    ...
}
```

Si ejecutamos los test, vamos a observar que falla y esto es intencional, ya que vamos a implementar la funcionalidad de que no se la imagen a menos que los test pases exitosamente.

## Incorporar testing en la construcción

Vamos a implementar el comando de pruebas dentro del archivo de Dockerfile, una vez que se haya copiado el archivo de `app.js`

```Dockerfile
...

COPY app.js ./

RUN npm run test

CMD [ "node", "app.js" ]
```

Cuando tratamos de crear la imagen, se va a imprimir un error ya que bo reconoce los archivos de testing. Para solucionar este podemos escribir la siguiente instrucción (el inconveniente es que mapeará todo el directorio del proyecto incluyendo los módulos de node):

```Dockerfile
...
COPY . .
RUN npm run test
```

Si intentamos crear la imagen de nuevo, no podemos avanzar, por que los test no logran pasar, pero cuando corregimos el test por el de a continuación, la imagen avanza en su proceso:

```js
const { syncDB } = require("../../tasks/sync-db")


describe('Pruebas en syncDB', () => {
    test('Debe ejecutar el proceso 2 veces', () => {
        syncDB()
        const times = syncDB()
        expect(times).toBe(2)
    })
})
```

El inconveniente ahora es que la imagen pesa demasiado.

## Examinar la imagen creada

Lo primero será crear un contenedor con la última imagen que construimos:

```txt
$: docker container run -d <username>/cron-ticker:blast
```

Luego abrimos la ShellCommand del contenedor:

```txt
$: docker exec -it b55 /bin/sh 
```

> Es importante recordar que de ser necesario se debe ejecutar `export MSYS_NO_PATHCONV=1` cada que crea una instancia de GitBash.

Cuando listamos los ficheros dentro del contenedor, nos encontraremos con lo siguiente:

```txt
/app # ls
Dockerfile         node_modules       package.json       tasks
app.js             package-lock.json  pnpm-lock.yaml     tests
```

Si listamos todos los paquetes de node, nos daremos cuenta que tenemos un gran problema por que hay muchos módulos que no necesitamos, además de que los archivos de testing no son necesarios dentro de la imagen, solo lo usamos para condicionar la construcción de la misma.

## .dockerignore

Es un archivo similar al .gitignore, en el cual se especifica todo lo que hay que ignorar en el proceso de construcción de la imagen. Por ejemplo, para ignorar algunos archivos escribimos lo siguiente

```dockerignore
node_modules/
Dockerfile
package-lock.json
```

Si volvemos a construir la imagen, podremos observar que la imagen es un poco más pequeña. Cuando creamos un contenedor con dicha imagen y abrimos su ShellCommand, podremos listar los documentos que hay dentro del proyecto y notaremos que tanto el directorio `node_modules` y `package-lock.json` siguen en la imagen, y no hay que alarmarnos, esto se debe a la instrucción `npm install` que se redacto en el Dockerfile.

## Remover archivos y carpetas de la imagen

Una solución empírica para reducir el tamaño de la imagen, es ingresar a la terminal de un contenedor y eliminar los archivos y carpetas que no queremos. También podemos ir al Dockerfile y añadir una instrucción más:

```Dockerfile
...
RUN npm run test

RUN rm -rf tests && rm -rf node_modules

RUN npm install --prod

CMD [ "npm", "start" ]
```

Aunque ya no tiene la misma cantidad de archivos o directorios, la imagen pesa más que lo anterior, y esto se debe a que hay más layers en el Dockerfile

## Forzar una plataforma en la construcción

Cuando necesitamos especificar una plataforma de manera forzada, cambiamos la instrucción de FROM, por ejemplo:

```Dockerfile
FROM --platform:arm64 node:19.2-alpine3.16
...
```

Con el cambio de plataforma, toda la imagen se vuelve a construir, y si la publicamos podremos observar que se actualiza la arquitectura del sistema operativo.

## [BuildX](https://docs.docker.com/build/building/multi-platform/#getting-started)

Para saber cuales builders tenemos, ejecutamos el siguiente comando:

```txt
$: docker buildx ls
NAME/NODE       DRIVER/ENDPOINT STATUS  BUILDKIT PLATFORMS
default *       docker
  default       default         running 20.10.21 linux/amd64, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/arm/v7, linux/arm/v6
desktop-linux   docker
  desktop-linux desktop-linux   running 20.10.21 linux/amd64, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/arm/v7, linux/arm/v6
```

Para crear un nuevo builder ejecutamos el siguiente comando:

```txt
$: docker buildx create --name mybuilder --driver docker-container --bootstrap
```

Una vez descargado el driver podemos usarlo con el siguiente comando:

```txt
$: docker buildx use mybuilder
```

Volvemos a listar los builders:

```txt
$: docker buildx ls
NAME/NODE       DRIVER/ENDPOINT                STATUS  BUILDKIT PLATFORMS
mybuilder *     docker-container
  mybuilder0    npipe:////./pipe/docker_engine running v0.11.0  linux/amd64, linux/amd64/v2, linux/amd64/v3, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/mips64le, linux/mips64, linux/arm/v7, linux/arm/v6
default         docker
  default       default                        running 20.10.21 linux/amd64, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/arm/v7, linux/arm/v6
desktop-linux   docker
  desktop-linux desktop-linux                  running 20.10.21 linux/amd64, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/arm/v7, linux/arm/v6
```

Podemos inspeccionar el builder actual con el siguiente comando:

```txt
$: docker buildx inspect
Name:   mybuilder
Driver: docker-container

Nodes:
Name:      mybuilder0
Endpoint:  npipe:////./pipe/docker_engine
Status:    running
Buildkit:  v0.11.0
Platforms: linux/amd64, linux/amd64/v2, linux/amd64/v3, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/mips64le, linux/mips64, linux/arm/v7, linux/arm/v6
```

Ahora dentro de nuestro Dockerfile vamos a actualizar la sentencia FROM con lo siguiente:

```Dockerfile
FROM --platform=$BUILDPLATFORM node:19.2-alpine3.16
```

Y ahora podemos construir la imagen en diversas arquitecturas y subirla al repositorio de DockerHub:

```txt
$: docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t <username>/cron-ticker:ninja --push .
```
