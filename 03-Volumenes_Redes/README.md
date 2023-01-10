# Sección 03: Volúmenes y Redes

Esta sección empieza a ponerse más interesante con los siguientes temas:

- Terminal interactiva dentro del contenedor
- Aplicaciones con múltiples contenedores
- Redes
- Volúmenes
- Mapeo de directorios y relaciones
- Montar un servidor Apache con PHPMyAdmin junto a MariaDB
- Revisar el file system de alpine y node

Esta sección empieza a dejar bases para el uso de los contenedores a otro nivel.

## Ejercicio sin volúmenes - Montar base de datos

### Actividad

Para esta lección necesitamos seguir los siguientes pasos:

1. Montar la imagen de MariaDB con el tag jammy, publicar en el puerto 3306 del contenedor con el puerto 3306 de nuestro equipo, colocarle el nombre al contenedor de __world-db__ (--name world-db) y definir las siguientes variables de entorno:

    - `MARIADB_USER=example-user`
    - `MARIADB_PASSWORD=user-password`
    - `MARIADB_ROOT_PASSWORD=root-secret-password`
    - `MARIADB_DATABASE=world-db`

2. Conectarse usando Table Plus a la base de datos con las credenciales del usuario (NO EL ROOT) y conectarse a la base de datos `world-db`
3. Ejecutar el query de creación de tablas e inserción de los datos que se encuentran en [documento adjunto](world-221207-123207.sql)
4. Revisar que efectivamente tengamos la data

### Solución

1. ```txt
   $: docker container run \
        -dp 3306:3306 \
        --name world-db \
        -e MARIADB_USER=example-user \
        -e MARIADB_PASSWORD=user-password \
        -e MARIADB_ROOT_PASSWORD=root-secret-password \
        -e MARIADB_DATABASE=world-db \
        mariadb:jammy
   
   e3637474b80ec55af086cda8072a3522ebfd637d6eea4bbf48e2ff502e8d9274
   
   $: docker container ls

   CONTAINER ID   IMAGE           COMMAND                  CREATED          STATUS          PORTS                    NAMES
   e3637474b80e   mariadb:jammy   "docker-entrypoint.s…"   34 seconds ago   Up 33 seconds   0.0.0.0:3306->3306/tcp   world-db
   ```

2. |Key|Value|
   |---|---|
   |Connection|MariaDB|
   |Name|`world-db`|
   |Host|`localhost`|
   |Port|`3306`|
   |User|`example-user`|
   |Password|`user-password`|
   |Database|`world-db`|

3. En la consola de Table Plus se copio todo el contenido del [archivo adjunto](world-221207-123207.sql), se seleccionó todo y posteriormente se presionó la opción de `Run Current`.
4. Ahora recargamos la aplicación de Table Plus y podemos observar las tablas `country` y `countrylanguage` e internamente los registros para cada uno.

## Tipos de volúmenes

Hay 3 tipos de volúmenes:

1. Named Volumes: Son completamente manejados por Docker
2. Bind Volumes: Dependen de la estructura del directorio y del sistema operativo del la maquina Host
3. Anonymous Volumes: Solo se le especifica el path del contenedor y Docker lo asigna automáticamente al host.

Vamos a crear un espacio persistente en nuestro equipo, es decir un volumen, para lo cual usamos el siguiente comando:

```txt
$: docker volume create world-db
```

Podemos inspeccionar el contenido del mismo con el siguiente comando:

```txt
$: docker volume inspect world-db
```

Ahora, vamos a usar el volumen, pero primero necesitamos copiar el comando para crear el contenedor de la [sección anterior](README.md#solución), y le añadimos una nueva bandera para indicarle que se guarde en el volumen creado, dicha bandera requiere de la sintaxis `<volumen en el host>:<ubicación del volumen en docker>`, para la segunda parte de la sintaxis podemos consultar dentro de la documentación oficial de la imagen:

```txt
$: docker container run \
    -dp 3306:3306 \
    --name world-db \
    -e MARIADB_USER=example-user \
    -e MARIADB_PASSWORD=user-password \
    -e MARIADB_ROOT_PASSWORD=root-secret-password \
    -e MARIADB_DATABASE=world-db \
    --volume world-db:/var/lib/mysql \
    mariadb:jammy
```

Una vez hemos creado el nuevo contenedor, debemos hacer de nuevo el volcado de los registros dentro de la base de datos. Ahora vamos a ver la efectividad del volumen. Vamos a eliminar el contenedor y lo volvemos a crear apuntando a la dirección del volumen:

```txt
$: docker container rm -f 873

$: docker container run \
    -dp 3306:3306 \
    --name world-db \
    -e MARIADB_USER=example-user \
    -e MARIADB_PASSWORD=user-password \
    -e MARIADB_ROOT_PASSWORD=root-secret-password \
    -e MARIADB_DATABASE=world-db \
    --volume world-db:/var/lib/mysql \
    mariadb:jammy
```

Si volvemos a Table Plus podremos observar que la base de datos se ha mantenido y su información se ha persistido.

## phpMyAdmin

Para esta sección necesitamos mantener tanto con container como el volumen generados en la [sección pasada](README.md#tipos-de-volúmenes). Vamos a usar la `phpmyadmin` con el fin de tener una interfaz web para una base de datos mySQL o MariaDB:

```txt
$: docker pull phpmyadmin:5.2.0-apache
```

Ahora crearemos un contenedor que haga uso de un servidor arbitrario (según la propia documentación de la imagen) con el siguiente comando:

```txt
$: docker run \
    --name phpmyadmin \
    -dp 8080:80 \
    -e PMA_ARBITRARY=1 \
    phpmyadmin:5.2.0-apache
```

Una vez creado el contenedor, ingresamos en un navegador a la dirección `localhost:8080` podremos observar la interfaz de la aplicación de phpMyAdmin. Nosotros no podemos comunicar los 2 contenedores puesto que no están dentro de la misma red, ya que ambos se encuentran aislados entre ellos.

## Redes de contenedores

Necesitamos conectar los contenedores que creamos en secciones pasadas (la base de datos y phpMyAdmin). Para crear una red usamos el siguiente comando:

```txt
$: docker network create world-app
```

Podemos listar las redes usando el comando a continuación:

```txt
$: docker network ls
```

Para conectar los contenedores en una misma red usamos el siguiente comando:

```txt
$: docker container ls
CONTAINER ID   IMAGE                     COMMAND                  CREATED        STATUS         PORTS                    NAMES
de66bd14ca22   phpmyadmin:5.2.0-apache   "/docker-entrypoint.…"   15 hours ago   Up 7 minutes   0.0.0.0:8080->80/tcp     phpmyadmin
c38ea860b31f   mariadb:jammy             "docker-entrypoint.s…"   15 hours ago   Up 7 minutes   0.0.0.0:3306->3306/tcp   world-db

$: docker network connect world-app de6
$: docker network connect world-app c38
```

Podemos inspeccionar la red con el siguiente comando:

```txt
$: docker network inspect world-app
```

Con el comando anterior obtenemos una salida similar a la siguiente:

```txt
[
    {
        "Name": "world-app",
        "Id": "0cdcc44e40f6d3f5786645db1b5ea47126d11fb187fdf640a0114384fb75b089",
        "Created": "2023-01-10T15:15:33.8849804Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "c38ea860b31fcd47b77c8bf0f34228b02d17d4457cbbb6730e5cdc5b967fde06": {
                "Name": "world-db",
                "EndpointID": "05c51781b577bfe58bca1bfa775480f88b61a28377f9292f6b6789cc213c2087",
                "MacAddress": "02:42:ac:12:00:03",
                "IPv4Address": "172.18.0.3/16",
                "IPv6Address": ""
            },
            "de66bd14ca2270c3538e8ad669f2613bb27bb47bfd1b90026e3c89113c3d0e4a": {
                "Name": "phpmyadmin",
                "EndpointID": "04c4b9629d43bca00a72bb2daeb45306e6a4eb6b9bc78a2162b7f6458c9cd2e2",
                "MacAddress": "02:42:ac:12:00:02",
                "IPv4Address": "172.18.0.2/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```

Como podemos observar en la sección de `"Containers"` del output anterior, tenemos conectados correctamente los 2 contenedores que necesitamos, y si vamos a `localhost:8080` e ingresamos con los datos de abajo en el login de phpMyAdmin, tendremos acceso a la base de datos de world-db.

|Key|Value|
|--|--|
|Server|`world-db`|
|Username|`example-user`|
|Password|`user-password`|
