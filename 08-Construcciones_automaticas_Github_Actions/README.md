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
