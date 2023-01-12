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

## Correr, limpiar y otras consideraciones - Docker Compose

Podemos indicarle a nuestro archivo de `docker-compose.yaml` que cree o haga uso de un volumen para el contenedor de la base de datos:

```yaml
...
volumes:
    postgres-db:
```

Para ejecutar nuestro archivo debemos ubicarnos en el directorio que lo almacena y abrir una instancia de la terminal para ejecutar el siguiente comando:

```txt
$: docker compose up
```

Lo que vamos a notar es que no hace uso del volumen que creamos en el laboratorio, si no que crea un volumen con la nomenclatura de `<nombre del directorio>-postgres-db`. Lo que queremos es que haga uso del volumen que habíamos creado con anterioridad, y esto lo veremos en la próxima lección.

## Limpiar el docker compose y conectar volumen externo

Ya que no queremos un volumen nuevo, sino el que teníamos con anterioridad, vamos a cancelar el proceso del `docker compose up` y vamos a añadir un nuevo cambio dentro del archivo yaml (en algunos casos es necesario limpiar todo lo creado por el archivo con 7yZDFel fin de que reconozca los cambios, eso se puede hacer con `docker compose down`, excepto el volumen que si toca eliminar de manera manual):

```yaml
...
volumes:
    postgres-db:
        external: true
```

Cuando volvemos a usar el comando de `docker compose up`, se levantarán lo contenedores y podremos observar mediante el comando de listado de volúmenes, que estamos haciendo uso del volumen anterior, y mediante el listado de redes y el comando `inspect` observaremos que de manera automática tenemos una red que conecta los 2 servicios del archivo.

## Bind Volumes - Docker Compose

Lo primero que haremos será usar el comando `docker compose down` para eliminar todo lo creo el archivo, posteriormente eliminamos los volumes inactivos con el comando `docker volume prune`. Lo que haremos a continuación es comentar las líneas relacionadas a volumes dentro del archivo de `docker-compose.yaml`, luego añadimos una línea dentro de `volumes` en el primer servicio, con el fin de enlazar a un directorio del equipo host:

```yaml
...
services:
    db:
        ...
        volumes:
            - ./postgres:/var/lib/postgresql/data
        ...
```

Con esto procuramos que se conecte con el directorio host de `postgres`. Cuando ejecutamos el comando para levantar el archivo, si no tenemos la carpeta, se creará de manera automática y además guardará la información que se va añadiendo en el directorio de `/var/lib/postgresql/data`. Si ejecutamos el comando `docker compose down`, vamos a observar que la carpeta `postgres` en el equipo host se va a mantener y servirá para persistir la información en una próxima subida del archivo con sus servicios. Podemos aplicar la misma idea de persistir en un volumen la información del servicio de pgAdmin, y por ejemplo, la configuración de un servidor será guardada dentro del volumen:

```yaml
...
services:
    ...
    pgAdmin:
        ...
        volumes:
            - ./pgadmin:/var/lib/pgadmin
        ...
```

## Multi-Container app - Base de datos Mongo

Vamos a crear un nuevo directorio dentro dentro del cual creamos un nuevo archivo `docker-compose.yaml` y un `.env`. Dentro del primer archivo añadimos las siguientes instrucciones para crear un contenedor con la imagen de mongo:

```yaml
version: '3'

services:
    mongo_db:
        container_name: pokemon_db
        image: mongo:6.0
        volumes:
            - poke-vol:/data/db
        ports:
            - 27017:27017
        restart: always

volumes:
    poke-vol:
        external: false
```

Una vez se haya descargado la imagen y se haya levantado el contenedor, vamos a TablePlus y testeamos la conexión con los siguientes datos:

| Key | Value |
| --- | ----- |
| Name | `temporal-pokeapp` |
| URL | `mongodb://localhost:27017` |

Una vez comprado que si funciona, entonces bajamos lo creado con  `docker compose down`.

## Variables de entorno - MongoDB

Vamos a añadir a nuestro contenedor las variables de entorno para el usuario y el password:

```yaml
services:
    mongo_db:
        ...
        environment:
            MONGO_INITDB_ROOT_USERNAME: mongoadmin
            MONGO_INITDB_ROOT_PASSWORD: mongoadmin
...
```

Otra configuración será que se obligue la autenticación para el ingreso a la base de datos del contenedor. En la documentación de la imagen de Mongo dice que se debe usar el comando `--auth`, por lo tanto dentro de la configuración del servicio en el archivo `docker-compose.yaml` añadimos la instrucción `command`:

```yaml
services:
    mongo_db:
        ...
        command: [ '--auth' ]
...
```

Si intentamos ejecutar el archivo, no va a generar ningún error al momento de la creación del contenedor con la base de datos. Pero cuando intentamos ingresar a la base de datos con los datos de abajo, nos dará un error de autenticación, y esto se debe a que las variables de usuario y password se establecen en el momento de la inicialización de la base de datos, paso que no está ocurriendo en estos momentos puesto que habíamos almacenado la información en un volumen, pero nos indica que el comando `--auth` si se está aplicando. Para arreglar este error debemos bajar el docker compose y eliminar el volumen asociado, y volver a subir el archivo.

| Key | Value |
| --- | ----- |
| Name | `temporal-pokeapp` |
| URL | `mongodb://<usuario>:<password>@localhost:27017` |

Ahora, vamos a darle el toque de seguridad usando las variables de entorno desde el archivo `.env`. Por ejemplo definimos que como variables de entorno tengamos el usuario, la contraseña y el nombre de la base de datos:

```.env
MONGO_USERNAME = admin
MONGO_PASSWORD = 1234567890
MONGO_DATABASE = pokemon_database
```

Para hacer uso de dichas variables dentro del archivo `docker-compose.yaml` debemos emplear la sintaxis `${var}`:

```yaml
...
services:
    mongo_db:
        container_name: ${MONGO_DATABASE}
        ...
        environment:
            MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
            MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
        ...
...
```

Ahora, bajamos el docker compose y eliminamos el volumen asociado, con el fin de que se puedan tomar las nuevas configuraciones. Cuando se levante de nuevo el archivo, podremos hacer el test con las nuevas variables definidas.

## Multi-container app - Visor de Base de Datos

Vamos a buscar la imagen oficial de mongo-express en Docker Hub, y configuramos las instrucciones para crear el contenedor con la imagen:

```yaml
version: '3'

services:
    ...
    mongo-express:
        depends_on:
            - mongo_db
        image: mongo-express:1.0.0-alpha.4
        environment:
            ME_CONFIG_MONGODBADMINUSERNAME: ${MONGO_USERNAME}
            ME_CONFIG_MONGODB_ADMINPASSWORD: ${MONGO_PASSWORD}
            ME_CONFIG_MONGODB_SERVER: ${MONGO_DATABASE}
        ports:
            - 8080:8081
        restart: always
...
```

Levantamos el docker compose y ahora podremos ingresar en un navegador a `localhost:8080`, en el cual encontraremos un dashboard básico para el servidor de la base de datos y por medio del cual podremos realizar las acciones necesarias. Para mantener un estándar de seguridad un poco más alto, vamos a evitar exponer el puerto del contenedor de la base de datos, con el fin de que solo los contenedores que se encuentren dentro de la misma red se puedan comunicar solo entre ellos.
