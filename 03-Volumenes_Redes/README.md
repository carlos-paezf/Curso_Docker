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
