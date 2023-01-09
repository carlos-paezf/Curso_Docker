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
