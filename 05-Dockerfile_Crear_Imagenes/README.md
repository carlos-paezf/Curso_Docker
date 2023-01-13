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
