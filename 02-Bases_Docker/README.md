# Sección 02: Bases de Docker

Esta sección introductoria a Docker, nos explicará cosas como: ¿Qué es Docker?, ¿Por qué debo de aprenderlo? y ¿Para qué me puede servir?.

También empezaremos con nuestros primeros comandos:

- docker container:
  - run
  - remove
  - list
  - publish
  - environment variables
  - logs
  - detached
- docker pull

Adicionalmente se mostrará como hacer lo mismo que hicimos directamente desde Docker Desktop, pero se recomienda fuertemente que primero aprendamos los comandos desde la consola antes de intentar hacer todo directamente desde Docker Desktop y así saber lo que hacen las GUIs (Graphic User Interfaces).

## ¿Qué es Docker? ¿Por qué debo saberlo?

Antes de docker se complicaba la instalación de herramientas y versiones especificas, ya que puede ser que en diferentes sistemas operativos las aplicaciones son son compatibles, no tiene el instalador o no es compatible con la distribución del sistema operativo. El problema se complica si se tienen otras aplicaciones que requieren de versiones diferentes de las herramientas, lo cual se convierte en una tarea imposible de sostener.

Una solución fueron las maquinas virtuales, pero estás pueden ser muy pesadas y muy lentas porque se emula la capa de aplicaciones y Kernel del SO, además de que se deben cambiar, iniciar, ejecutar, transferir... Y es peor si tenemos diversas aplicaciones.

Docker provee una imagen con una "fotografía" de las versiones requerida para la aplicación, las cuales se montan en un contenedor y luego se ejecutan en conjunto sin afectar las otras aplicaciones. Con Docker tenemos las siguientes ventajas:

- Cada contenedor está aislado de los demás
- Es posible ejecutar varias instancias de  la misma versión o diferentes versiones sin configuraciones adicionales
- Con un comando puedes descargar, levantar y correr todo lo que se necesita
- Cada contenedor contiene todo lo que necesita para ejecutarse
- Indiferente el sistema operativo HOST
- A diferencia de las maquinas virtuales, los contenedores se levantan en milésimas de segundo a unos cuantos segundos dependiendo de los procesos.

## Hola Mundo en Docker

Vamos a descargar una imagen inicial llamada [hello-world](https://hub.docker.com/_/hello-world) desde el repositorio de DockerHub, para ello ejecutamos el siguiente comando (por defecto se descarga la versión `latest`):

```txt
$: docker pull hello-world
```

Para ejecutar la imagen usamos el siguiente comando:

```txt
$: docker container run hello-world
```

La salida que obtenemos en la consola es la siguiente

```txt
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

En el primer paso de la salida anterior se menciona a Docker Daemon, el cual es el servicio en segundo plano que se ejecuta en el host que administra la creación, ejecución y distribución de contenedores Docker. Un contenedor es una instancia de una imagen ejecutándose en un ambiente aislado.

Si ingresamos a Docker Desktop, podremos observar un contenedor que se encuentra con el estado de `EXITED`, ya que la imagen son cumple la función de imprimir algo en consola y terminar su proceso.

## Borrar contenedores e imágenes

Antes de eliminar un contenedor, necesitamos listar los mismos, puesto que, por ejemplo, la imagen de hello-world genera nombres aleatorios, para ello usamos el siguiente comando (la bandera `-a` nos ayuda a listar incluso los que no se están ejecutando):

```txt
$: docker container ls -a
```

La manera antigua de listas los containers era con el comando `docker ps`, pero preferimos irnos adaptando a la nueva CLI.

Para eliminar un contenedor podemos hacer uso de su nombre, otra forma es mediante su id o los primeros 3 caracteres del mismo. Por ejemplo al momento de listar los contenedores con el comando `docker container ls -a` se nos muestra el siguiente output:

```txt
CONTAINER ID   IMAGE         COMMAND   CREATED              STATUS                          PORTS   NAMES
8d072d59fbd5   hello-world   "/hello"  About a minute ago   Exited (0) About a minute ago           relaxed_moser 
```

Entonces, a partir de la información anterior podemos eliminar el contenedor de 3 maneras distintas:

1. ```txt
   $: docker container rm relaxed_moser
   ```

2. ```txt
   $: docker container rm 8d072d59fbd5
   ```

3. ```txt
   $: docker container rm 8d0
   ```

Si al momento de listar los contenedores nos encontramos con varios que están detenidos y tenemos la disposición de eliminarlos, podemos usar el siguiente comando:

```txt
$: docker container prune
```

Si queremos ser más extremistas y eliminar TODOS los contenedores, incluyendo los que se encuentran corriendo, usaríamos el siguiente comando (Nota 1: no es recomendado. Nota 2: Lo que se encuentra dentro de `$(...)` se puede considerar como un arreglo. Nota 3. La bandera `-f` fuerza la ejecución del comando):

```txt
$: docker container rm $(docker container ls -a) -f
```

Para el caso de las imágenes, podemos listar una a una con el siguiente comando:

```txt
$: docker image ls
```

Y para hacer la eliminación de cualquiera de ellas, tenemos las mismas opciones de eliminación que tenemos con los contenedores (nombre, id, o 3 primeros caracteres del id):

1. ```txt
   $: docker image rm hello-world
   ```

2. ```txt
   $: docker image rm feb5d9fea6a5
   ```

3. ```txt
   $: docker image rm feb
   ```

## Docker Desktop - Mismos comandos usados

En Docker Desktop se simplifica los procesos, puesto que podemos hacer la búsqueda de imágenes o contenedores a través de inputs, podemos observar de una manera más estética todos los contenedores, volúmenes o imágenes; los logs de los contenedores se encuentran a un click de distancia. Básicamente todas las acciones son fáciles de realizar desde la GUI de Docker Desktop, aún así se recomienda que se usen más los comandos que la interfaz de la aplicación.

## Publish and Detached modes

Para iniciar vamos a abrir en un navegador la dirección de `localhost`, este se abrirá directamente en el puesto `80` en caso de que algo corriendo en ese puerto, podemos detenerlo, o cambiamos de puerto la instalación que vamos a hacer a continuación.

Vamos a levantar la imagen oficial de Docker llamada `getting-started`:

```txt
$: docker container run -d -p 80:80 docker/getting-started
```

Si queremos cambiar el puerto de escucha en el host, cambiamos de `80:80` a `<puerto en el host>:80`. Las banderas usadas en el comando significan lo siguiente:

- `-d` (Detached mode) ejecutar el contenedor en background
- `-p` (Publish mode) mapea el puerto del host al puerto del contenedor.

Podemos simplificar el uso de los dos comandos haciendo uso de la bandera `-dp`.

Si regresamos al `localhost` con el puerto 80, o el definido por nosotros, vamos a observar que tenemos la guía oficial de Docker.

Si queremos detener el contenedor, hacemos uso del comando `stop`, y para volver a ejecutarlo empleamos `start`.

Por ejemplo, para el caso del contenedor que tenemos ejecutando del tutorial de Docker no conocemos o no recordamos el nombre o id, entonces ejecutamos el comando para listar contenedores:

```txt
$: docker container ls
```

Del comando anterior obtenemos el siguiente output:

```txt
CONTAINER ID   IMAGE                    COMMAND                  CREATED         STATUS          PORTS                    NAMES
0511bd729752   docker/getting-started   "/docker-entrypoint.…"   7 minutes ago   Up 7 minutes    0.0.0.0:80->80/tcp       nifty_panini
```

Para detener el contenedor podemos hacer uso de su nombre, su id o los 3 primeros caracteres del mismo:

1. ```txt
   $: docker container stop nifty_panini
   ```

2. ```txt
   $: docker container stop 0511bd729752
   ```

3. ```txt
   $: docker container stop 051
   ```

Para levantar de nuevo el contenedor, es decir, para ponerlo en ejecución, tenemos las mismas 3 opciones anterior, pero haciendo uso del comando `start`

1. ```txt
   $: docker container start nifty_panini
   ```

2. ```txt
   $: docker container start 0511bd729752
   ```

3. ```txt
   $: docker container start 051
   ```

Para la eliminación del contenedor y de la imagen usamos alguna de las opciones mencionadas en la sección de [Borrar contenedores e imágenes](README.md#borrar-contenedores-e-imágenes), en este caso ejecute los siguientes comandos:

```txt
$: docker container rm -f 051
```

```txt
$: docker image ls
```

```txt
$: docker image rm docker/getting-started
```

## Variables de entorno

Las variables de entorno son variables que existen en un entorno, en este caso un contenedor, se definen con el flag `-e`. Vamos a descargar la imagen oficial de [Postgres](https://hub.docker.com/_/postgres) en su versión `latest` con el siguiente comando (podemos definir la versión que queremos descargar escribiendo `postgres:<version>`):

```txt
$: docker pull postgres
```

En la documentación de la imagen nos mencionan las variables de entorno que requieren al momento de crear una instancia de la misma. En este ejemplo vamos a crear un contenedor al cual le definimos la variable de entorno de la contraseña:

```txt
$: docker container run --name some-postgres -e POSTGRES_PASSWORD=my_password -d postgres
```

Por defecto no podemos comunicarnos con ningún puerto con el contenedor, podemos definir un puerto usando la bandera `-p` o `-dp` si queremos definir que también corra en background:

```txt
$: docker container run --name some-postgres -e POSTGRES_PASSWORD=my_password -dp 5433:5432 postgres
```

## Usar la imagen de Postgres

Podemos usar TablePlus para observar la base de datos de nuestro contenedor, en este caso creamos una nueva conexión con los siguiente datos:

|Key|Value|
|--|--|
|Connection|Postgres|
|Name|`some-postgres` (cualquier nombre representativo)|
|Host|`localhost`|
|Port|`5433` (puerto definidor por nosotros, o `5432` por default)|
|User|`postgres` (super-usuario definido por defecto por postgres)|
|Password|`my_password` (contraseña definida como variable de entorno al momento de crear el contenedor)|
|Database|(ninguna, puesto que nos conectamos a la database raíz del contenedor)|

Una vez conectados, podemos crear bases de datos, nuevas tablas dentro de las mismas y demás... Es importante recordar que si eliminamos el contenedor toda la información creada se perderá, a menos que creemos un volumen (en próximas secciones).

Para terminar vamos a eliminar el contenedor usado:

```txt
$: docker container stop some-docker
```

```txt
$: docker container rm some-docker
```

## Multiples instancias de Postgres

Vamos a crear múltiples contenedores de postgres con diversas versiones de la imagen, para lo cual usamos los siguientes comandos (para los saltos de línea en consola usamos `\` en Linux y <code>`</code> en Windows):

```txt
$: docker container run \
      --name postgres-alpha \
      -e POSTGRES_PASSWORD=my_pass1 \
      -dp 5433:5432 \
      postgres:latest

$: docker container run \
      --name postgres-beta \
      -e POSTGRES_PASSWORD=my_pass2 \
      -dp 5434:5432 \
      postgres:15-alpine
```

Podemos listar los 2 contenedores creados activos con el comando `docker container ps`:

```txt
CONTAINER ID   IMAGE                COMMAND                  CREATED              STATUS              PORTS                    NAMES
cc6570edb62e   postgres:15-alpine   "docker-entrypoint.s…"   56 seconds ago       Up 55 seconds       0.0.0.0:5434->5432/tcp   postgres-beta
818b6444e25f   postgres:latest      "docker-entrypoint.s…"   About a minute ago   Up About a minute   0.0.0.0:5433->5432/tcp   postgres-alpha 
```

Ahora vamos a TablePlus y creamos 2 nuevas conexiones con los siguientes datos:

|Key|Conexión 1|Conexión 2|
|--|--|--|
|Connection|PostgreSQL|PostgreSQL|
|Name|`postgres-alpha`|`postgres-beta`|
|Host|`localhost`|`localhost`|
|Port|`5433`|`5434`|
|User|`postgres`|`postgres`|
|Password|`my_pass1`|`my_pass2`|
|Database|--|--|

Como se ha podido comprobar, las 2 instancias de Postgres con diferentes versiones funcionan correctamente y a a la misma vez en el mismo equipo, también funciona si son contenedores con la misma versión de la imagen. Es muy importante que los nombres y puertos sean diferentes en cada contenedor.

En caso de que montemos un contenedor en el mismo puerto de otro, se creará una instancia que no se ejecuta y que debemos eliminar antes de volver a intentar subir el contenedor en un nuevo puerto.

Para detener y eliminar los contenedores que están en ejecución usamos el siguiente comando (usamos la bandera `-f` por qué estamos seguros de eliminarlos y queremos acortar proceso):

```txt
$: docker container rm -f postgres-alpha postgres-beta
```

## Logs del contenedor

Vamos a descargar la imagen oficial de MariaDB en su versión de `jammy`:

```txt
$: docker pull mariadb:jammy
```

Ahora creamos un contenedor en background que generara una contraseña random para el usuario root y la intensión será rescatar dicho password desde los logs.

Para la primera parte usamos el siguiente comando:

```txt
$: docker container run \
      -e MARIADB_RANDOM_ROOT_PASSWORD=yes \
      -dp 3306:3306 \
      mariadb:jammy
```

Para observar los logs necesitamos el id del contenedor, ya que no le pusimos un nombre, dicho id se muestra al momento de crear el contenedor o podemos usar el comando `docker container ls`. Los logs aparecen si usamos el siguiente comando:

```txt
$: docker container logs <id del contenedor>
```

La salida que obtendremos será similar a la siguiente:

```txt
2023-01-09 20:51:38+00:00 [Note] [Entrypoint]: Entrypoint script for MariaDB Server 1:10.10.2+maria~ubu2204 started.
2023-01-09 20:51:38+00:00 [Note] [Entrypoint]: Switching to dedicated user 'mysql'
2023-01-09 20:51:38+00:00 [Note] [Entrypoint]: Entrypoint script for MariaDB Server 1:10.10.2+maria~ubu2204 started.
2023-01-09 20:51:38+00:00 [Note] [Entrypoint]: Initializing database files


PLEASE REMEMBER TO SET A PASSWORD FOR THE MariaDB root USER !
To do so, start the server, then issue the following command:

'/usr/bin/mysql_secure_installation'

which will also give you the option of removing the test
databases and anonymous user created by default.  This is
strongly recommended for production servers.

See the MariaDB Knowledgebase at https://mariadb.com/kb

Please report any problems at https://mariadb.org/jira

The latest information about MariaDB is available at https://mariadb.org/.

Consider joining MariaDB's strong and vibrant community:
https://mariadb.org/get-involved/

2023-01-09 20:51:40+00:00 [Note] [Entrypoint]: Database files initialized
2023-01-09 20:51:40+00:00 [Note] [Entrypoint]: Starting temporary server
2023-01-09 20:51:40+00:00 [Note] [Entrypoint]: Waiting for server startup
2023-01-09 20:51:40 0 [Note] mariadbd (server 10.10.2-MariaDB-1:10.10.2+maria~ubu2204) starting as process 99 ...
2023-01-09 20:51:40 0 [Note] InnoDB: Compressed tables use zlib 1.2.11
2023-01-09 20:51:40 0 [Note] InnoDB: Number of transaction pools: 1
2023-01-09 20:51:40 0 [Note] InnoDB: Using crc32 + pclmulqdq instructions
2023-01-09 20:51:40 0 [Note] mariadbd: O_TMPFILE is not supported on /tmp (disabling future attempts)
2023-01-09 20:51:40 0 [Note] InnoDB: Using liburing
2023-01-09 20:51:40 0 [Note] InnoDB: Initializing buffer pool, total size = 128.000MiB, chunk size = 2.000MiB
2023-01-09 20:51:40 0 [Note] InnoDB: Completed initialization of buffer pool
2023-01-09 20:51:40 0 [Note] InnoDB: File system buffers for log disabled (block size=4096 bytes)
2023-01-09 20:51:41 0 [Note] InnoDB: 128 rollback segments are active.
2023-01-09 20:51:41 0 [Note] InnoDB: Setting file './ibtmp1' size to 12.000MiB. Physically writing the file full; Please wait ...
2023-01-09 20:51:41 0 [Note] InnoDB: File './ibtmp1' size is now 12.000MiB.
2023-01-09 20:51:41 0 [Note] InnoDB: log sequence number 46590; transaction id 14
2023-01-09 20:51:41 0 [Note] Plugin 'FEEDBACK' is disabled.
2023-01-09 20:51:41 0 [Warning] 'user' entry 'root@201e875a9759' ignored in --skip-name-resolve mode.
2023-01-09 20:51:41 0 [Warning] 'proxies_priv' entry '@% root@201e875a9759' ignored in --skip-name-resolve mode.
2023-01-09 20:51:41 0 [Note] mariadbd: ready for connections.
Version: '10.10.2-MariaDB-1:10.10.2+maria~ubu2204'  socket: '/run/mysqld/mysqld.sock'  port: 0  mariadb.org binary distribution
2023-01-09 20:51:41+00:00 [Note] [Entrypoint]: Temporary server started.
2023-01-09 20:51:46+00:00 [Note] [Entrypoint]: GENERATED ROOT PASSWORD: HKc=):D(TuP:*`wqtk?Kw`8ui^jOd|&F
2023-01-09 20:51:46+00:00 [Note] [Entrypoint]: Securing system users (equivalent to running mysql_secure_installation)

2023-01-09 20:51:46+00:00 [Note] [Entrypoint]: Stopping temporary server
2023-01-09 20:51:46 0 [Note] mariadbd (initiated by: unknown): Normal shutdown
2023-01-09 20:51:46 0 [Note] InnoDB: FTS optimize thread exiting.
2023-01-09 20:51:46 0 [Note] InnoDB: Starting shutdown...
2023-01-09 20:51:46 0 [Note] InnoDB: Dumping buffer pool(s) to /var/lib/mysql/ib_buffer_pool
2023-01-09 20:51:46 0 [Note] InnoDB: Buffer pool(s) dump completed at 230109 20:51:46
2023-01-09 20:51:46 0 [Note] InnoDB: Removed temporary tablespace data file: "./ibtmp1"
2023-01-09 20:51:46 0 [Note] InnoDB: Shutdown completed; log sequence number 46590; transaction id 15
2023-01-09 20:51:46 0 [Note] mariadbd: Shutdown complete

2023-01-09 20:51:46+00:00 [Note] [Entrypoint]: Temporary server stopped

2023-01-09 20:51:46+00:00 [Note] [Entrypoint]: MariaDB init process done. Ready for start up.

2023-01-09 20:51:46 0 [Note] mariadbd (server 10.10.2-MariaDB-1:10.10.2+maria~ubu2204) starting as process 1 ...
2023-01-09 20:51:46 0 [Note] InnoDB: Compressed tables use zlib 1.2.11
2023-01-09 20:51:46 0 [Note] InnoDB: Number of transaction pools: 1
2023-01-09 20:51:46 0 [Note] InnoDB: Using crc32 + pclmulqdq instructions
2023-01-09 20:51:46 0 [Note] mariadbd: O_TMPFILE is not supported on /tmp (disabling future attempts)
2023-01-09 20:51:46 0 [Note] InnoDB: Using liburing
2023-01-09 20:51:46 0 [Note] InnoDB: Initializing buffer pool, total size = 128.000MiB, chunk size = 2.000MiB
2023-01-09 20:51:46 0 [Note] InnoDB: Completed initialization of buffer pool
2023-01-09 20:51:46 0 [Note] InnoDB: File system buffers for log disabled (block size=4096 bytes)
2023-01-09 20:51:46 0 [Note] InnoDB: 128 rollback segments are active.
2023-01-09 20:51:46 0 [Note] InnoDB: Setting file './ibtmp1' size to 12.000MiB. Physically writing the file full; Please wait ...
2023-01-09 20:51:46 0 [Note] InnoDB: File './ibtmp1' size is now 12.000MiB.
2023-01-09 20:51:46 0 [Note] InnoDB: log sequence number 46590; transaction id 14
2023-01-09 20:51:46 0 [Note] InnoDB: Loading buffer pool(s) from /var/lib/mysql/ib_buffer_pool
2023-01-09 20:51:46 0 [Note] Plugin 'FEEDBACK' is disabled.
2023-01-09 20:51:46 0 [Warning] You need to use --log-bin to make --expire-logs-days or --binlog-expire-logs-seconds work.
2023-01-09 20:51:46 0 [Note] Server socket created on IP: '0.0.0.0'.
2023-01-09 20:51:46 0 [Note] InnoDB: Buffer pool(s) load completed at 230109 20:51:46
2023-01-09 20:51:46 0 [Note] Server socket created on IP: '::'.
2023-01-09 20:51:46 0 [Note] mariadbd: ready for connections.
Version: '10.10.2-MariaDB-1:10.10.2+maria~ubu2204'  socket: '/run/mysqld/mysqld.sock'  port: 3306  mariadb.org binary distribution
```

Revisando el output encontraremos que la contraseña random que se generó para este caso fue ```HKc=):D(TuP:*`wqtk?Kw`8ui^jOd|&F```.

Ahora podemos conectarnos mediante TablePlus a la base de datos en el contenedor con la siguiente información:

|Key|Value|
|--|--|
|Connection|MariaDB|
|Name|`mariadb`|
|Host|`localhost`|
|Port|`3306`|
|User|`root`|
|Password| <code>HKc=):D(TuP:*`wqtk?Kw`8ui^jOd|&F</code> |
|Database|--|

Si queremos hacer seguimiento en tiempo real a los logs, podemos hacer uso del siguiente comando (podemos simplificar el `--follow` por `-f`):

```txt
$: docker container logs --follow <id del contenedor>
```

Si intentamos una conexión erronea o cual movimiento extraño a la base de datos, podremos observar en tiempo real el rechazo que aparece en el log:

```txt
...
2023-01-09 21:06:42 4 [Warning] Access denied for user 'root2'@'172.17.0.1' (using password: YES)
```
