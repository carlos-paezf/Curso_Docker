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
   COPY app.js package.json ./
   ```

Las anteriores instrucciones son las más usadas dentro de las construcción de imágenes de proyectos. En la próxima lección vamos a ver los pasos siguientes y la manera de construir la imagen.
