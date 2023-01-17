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
