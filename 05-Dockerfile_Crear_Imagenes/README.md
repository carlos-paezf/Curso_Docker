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
