# Sección 08: Construcciones automáticas - Github Actions

En esta sección aprenderemos a automatizar el proceso de construcción, despliegue y versionamiento de nuestras imágenes.

Puntualmente veremos:

- Github actions
- Github Semantic Versioning
- Automatic build
- Automatic push
- Mensajes de commit para disparar versiones
- Despliegues automáticos a registros privados

## Inicio del proyecto

Para esta sección vamos a usar el [proyecto adjunto](./graphql-actions/). Dentro de dicho proyecto reconocemos varios archivos que hemos usado en proyectos y secciones anteriores. Lo primero será comprobar que la aplicación funciona, por lo que usamos el comando `pnpm i` para reconstruir los módulos, y `pnpm start:dev` para ejecutarla en modo desarrollo. Si todo va bien, podemos ingresar a la dirección `localhost:3000/graphql` y hacer queries a nuestro server. Una vez hemos comprado que todo funciona, eliminamos los directorios de `node_modules/` y `dist/`

## GitHub - Repositorio del proyecto

Los pipelines son conocidos como GitHub Actions dentro de dicha plataforma, y son gratuitos mientras el proyecto sea público, los proyectos privados tienen cobro luego de cierta cuota. Lo que vamos a hacer es crear un repositorio en GitHub, al cual subimos el proyecto adjunto.

Dentro del directorio del proyecto ejecutamos `git init`, `git add .`, `git commit -m "Init Project"`, `git remote add origin <dirección del repo>`, `git push -u origin main`. En mi caso el proyecto quedo publicado en el repositorio [Docker-Github-Actions](https://github.com/carlos-paezf/Docker-GitHub-Actions)

## Configurar credenciales - GitHub Secrets

Dentro del repositorio en GitHub vamos a la sección de Settings, luego a Security, Secrets and variables, y luego vamos a Actions. Lo que vamos a guardar como secrets son el nombre de usuario u organización en DockerHub, por lo tanto pulsamos el botón de New repository secret, asignamos el nombre de `DOCKER_USERNAME`, y como secret añadimos el nombre de usuario. El siguiente secret será la contraseña, repetimos el mismo proceso, en este caso vamos a usar el nombre `DOCKER_PASSWORD`, pero en vez de usar nuestra contraseña, vamos a Docker Hub y en la sección de Security creamos un Access Token (los token solo se muestran una vez, por lo tanto es importante tenerlos guardados en lugares seguros).

Terminadas la configuración de las 2 variables, creamos un repositorio dentro de DockerHub al cual subiremos la imagen. Recordar que el acceso gratuito solo permite 1 repositorio privado, el cual viene bien para este proyecto.

## Primeros pasos de GitHub Actions

Dentro de las sección de Actions en nuestro repositorio de GitHub, buscamos `Docker image` y pasamos a configurarlo. Por defecto nos va a crear un archivo en `<repo>/.github/workflows/docker-image.yml`. La sección `on` configura los triggers mediante los cuales se reconoce que debe trabajar las a actions, los `jobs` son las actividades que debe ejecutar:

```yaml
name: Docker Image CI

on:
    push:
        branches: [ "main" ]
    pull_request:
        branches: [ "main" ]

jobs:

    build:

        runs-on: ubuntu-latest

        steps:
        - uses: actions/checkout@v3
        - name: Build the Docker image
            run: docker build . --file Dockerfile --tag my-image-name:$(date +%s)
```

Una sugerencia es que probemos que funciona la construcción de la imagen del proyecto, pero en este caso usaremos la construcción tradicional:

```txt
$: docker build -t <username>/docker-github-actions:0.0.1 .
```

Luego levantamos un contenedor con la imagen:

```txt
$: docker container run \
    --name github-actions \
    -dp 3000:3000 \
    <username>/docker-github-actions:0.0.1
```

## GitHub Actions - Steps

Los Steps de GitHub Actions son pasos similares a lo que hacemos en la construcción de una imagen. En nuestro repositorio se creo de manera automática el archivo con algunos pasos básicos, podemos hacer la edición del mismo desde GitHub, o podemos hacer un pull al repositorio local y modificarlo desde nuestro equipo, claro que luego debemos hacer un push para que el repo en la nube se actualice.

Vamos a crear un paso que realice un checkout de nuestro código:

```yaml
...
jobs:
    build:
        ...
        steps:
            - name: Checkout code
              uses: actions/checkout@v3
              with:
                  fetch-depth: 0
```

La segunda acción será el login en Docker, para la cual definimos como variables de entorno, las secrets que creamos en lecciones pasadas, y mediante la propiedad `run`, definimos el o los comandos que se deben usar (Cuando tenemos varios comandos que se deben ejecutar de manera independiente usamos el símbolo `|` luego de la definición de `run`, en caso de que sea solo un comando, podemos escribirlo inline).

```yaml
jobs:
    build:
        ...
        steps:
            ...
            - name: Docker Login
              env:
                  DOCKER_USER: ${{ secrets.DOCKER_USERNAME }}
                  DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
              run: |
                  echo "Login in Docker - Start"
                  docker login -u $DOCKER_USER -p $DOCKER_PASSWORD
                  echo "Login in Docker - End"
```

En estos momentos hacemos un commit con los cambios, y podemos observar dentro de la pestaña de Actions en el repositorio de GitHub, que se crea un nuevo workflow y tenemos la oportunidad de observar los logs de cada paso en el trabajo de `Build`.
