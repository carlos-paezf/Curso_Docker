# Sección 04: Multi-container - Apps - Docker Compose

En esta sección trabajaremos montando aplicaciones con multiples contenedores, técnicamente usaremos la herramienta del docker compose para ejecutar todas las instrucciones que levantan los contenedores con todo lo necesario para nuestra aplicación.

Puntualmente veremos:

- docker-compose.yml
- Crear servicios
- Volúmenes
  - Bind
  - Name
  - Externos
- Imágenes con tags
- Comandos de ejecución al montar una imagen
- Puertos
- Manejo de variables de entorno
- Nombres de servicios y servidores
- Dependencias de otros servicios

Esto dejará las bases para que comprendamos cómo trabajar con estos archivos que nos servirán mucho para dejar documentado cómo correr y configurar la aplicación.

## Laboratorio: Reforzamiento de lo aprendido

Para este laboratorio seguiremos los siguientes pasos:

1. Crear un volumen para almacenar la información de la base de datos:

   ```txt
   $: docker volume create postgres-db
   ```

2. Descargar imagen de postgres:15.1

   ```txt
   $: docker image pull postgres:15.1
   ```

3. Descargar imagen de dpage/pgadmin4:6.17
  
   ```txt
   $: docker image pull dpage/pgadmin4:6.17
   ```

4. Crear contenedor de postgres que este directamente conectado al volumen, pero que no este publicado en ningún puerto (es decir qe no hace uso de `-p`):

   ```txt
   $: docker container run -d \
        --name postgres-db \
        -e POSTGRES_PASSWORD=123456 \
        -v postgres-db:/var/lib/postgresql/data \
        postgres:15.1
   ```

5. Crear un contenedor para pdAdmin4 que este expuesto en el puerto 8080:

   ```txt
   $: docker container run \
        --name pgAdmin \
        -e PGADMIN_DEFAULT_PASSWORD=123456 \
        -e PGADMIN_DEFAULT_EMAIL=batman@jl.com \
        -dp 8080:80 \
        dpage/pgadmin4:6.17
   ```

6. Intentar la conexión a la base de datos, para lo cual se deben seguir estos pasos adicionales:

   1. Ingresar a `localhost:8080`
   2. Iniciar sesión con el correo `batman@jl.com` y la contraseña `123456`
   3. Click derecho en *Servers*
   4. Click en *Register* > *Server*
   5. Colocar un nombre al servidor
   6. Ir a la pestaña de *Connection*
   7. Colocar el hostname `postgres-db` (el mismo del contenedor)
   8. El username es `postgres` y el password es `123456`
   9. Probar la conexión

   > Este paso va a generar un error, por qué no se ha creado la red por medio del cual se conecten los contenedores instanciados

7. Crear la red para conectar los containers:

   ```txt
   $: docker network create postgres-net
   ```

8. Asignar los contenedores a la red:

   ```txt
   $: docker container ls
   CONTAINER ID   IMAGE                 COMMAND                  CREATED          STATUS          PORTS                           NAMES
   aaae0b94dc99   dpage/pgadmin4:6.17   "/entrypoint.sh"         13 minutes ago   Up 13 minutes   443/tcp, 0.0.0.0:8080->80/tcp   pgAdmin
   0012685f7698   postgres:15.1         "docker-entrypoint.s…"   16 minutes ago   Up 16 minutes   5432/tcp

   $: docker network connect postgres-net aaa
   $: docker network connect postgres-net 001 
   ```

9. Intentar de nuevo el paso 6. Si todo sale bien, crear una base de datos, schemas, tablas, insertar registros, etc, con el fin de comprobar que todo funciona.
10. Eliminar el contenedor de postgres y probar de nuevo en pgAdmin que el servidor ya no logre conectarse.
11. Recrear el contenedor.
12. Conectar el contenedor en la red como en el paso 8 y probar que la información si se haya persistido en el volumen al hacer uso nuevamente de pdAdmin

## Docker Compose - Multi Container Apps

Vamos a eliminar los contenedores del laboratorio anterior, pero vamos a conservar el volumen y network. Ahora vamos a crear un nuevo archivo llamado `docker-compose.yaml` (también se puede usar la extensión `.yml`). En dicho archivo vamos a añadir las siguientes instrucciones:

1. Indicamos la versión de comandos que debe reconocer Docker (la versión legacy es la `2.x`, la versión más reciente es la `3.x`).
2. Indicamos mediante el comando `services` que vamos a crear los contenedores.
3. Se instancia el contenedor con la base de datos, el cual tendrá cómo nombre de servicio `db`, definimos el nombre del container, la imagen que debe emplear, el volumen en el cual se va a persistir la data y las variables de entorno relacionadas al contenedor
4. Creamos el servicio `pdAdmin` el cual depende de que el servicio `db` haya sido levantado. Definimos el nombre del contenedor, la imagen, el puerto expuesto de nuestro equipo mapeado con el puerto del contenedor, por último añadimos las variables de entorno asignadas para el container.

```yaml
version: '3'

services:
    db:
        container_name: postgres_database
        image: postgres:15.1
        volumes:
            - postgres-db:/var/lib/postgresql/data
        environment:
            - POSTGRES_PASSWORD=123456

    pgAdmin:
        depends_on:
            - db
        container_name: pdAdmin
        image: dpage/pgadmin4:6.18
        ports:
            - 8080:80
        environment:
            - PGADMIN_DEFAULT_PASSWORD=123456
            - PGADMIN_DEFAULT_EMAIL=batman@justiceleague.com
```
