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
