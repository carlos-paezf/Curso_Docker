# Sección 07: Deployments y Registros

## Construcción de imagen, múltiples arquitecturas

Vamos a usar el ejercicio de `teslo-shop` de la sección anterior. Lo primero que haremos es crear un repositorio en Docker Hub en el cual subiremos la imagen que vamos a generar, luego vamos a usar BuildX para construir la imagen en múltiples arquitecturas:

```txt
$: docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t <username>/teslo-shop:1.0.0 --push .
```

Recordar que dentro del archivo Dockerfile debemos especificar la variable de platform `FROM --platform=$BUILDPLATFORM`.

Puede que se demore un poco más de lo normal debido a la cantidad de arquitecturas que se especifiquen, y del tamaño del proyecto. Otro aspecto que debemos tener en cuenta, es que podemos personalizar mediante lenguaje Markdown la descripción del repositorio en Docker Hub. Por ejemplo mediante una tabla se pueden mostrar mediante clave-valor las variables de entorno que se deben definir en nuestra imagen.

## Prueba de la imagen creada

Vamos a probar nuestra imagen, por lo que creamos un nuevo directorio que contenga solo el archivo de variables de entorno, y un `docker-compose.yaml` para indicar los servicios de la api y de la base de datos. En este caso indicamos que el servicio de app sea descargado de nuestro repositorio en Docker Hub, que dependa del servicio de la base de datos, y que siempre se recargue en caso de errores:

```yaml
version: '3'

services:
    app:
        image: <username>/teslo-shop:1.0.0
        depends_on:
            - db
        restart: always
        container_name: teslo-backend
        ports:
            - ${PORT}:${PORT}
        environment:
            APP_VERSION: ${APP_VERSION}
            STAGE: ${STAGE}
            DB_PASSWORD: ${DB_PASSWORD}
            DB_NAME: ${DB_NAME}
            DB_HOST: ${DB_HOST}
            DB_PORT: ${DB_PORT}
            DB_USERNAME: ${DB_USERNAME}
            PORT: ${PORT}
            HOST_API: ${HOST_API}
            JWT_SECRET: ${JWT_SECRET}
    db:
        image: postgres:14.3
        restart: always
        ports:
            - "5432:5432"
        environment:
            POSTGRES_PASSWORD: ${DB_PASSWORD}
            POSTGRES_DB: ${DB_NAME}
        container_name: ${DB_NAME}
        volumes:
            - postgres-db:/var/lib/postgresql/data

volumes:
    postgres-db:
        external: false
```

Con lo anterior listo, pasamos a probar usando el comando de:

```txt
$: docker-compose up
```

## Digital Ocean - Aprovisionamiento de Base de Datos

> Al día de hoy, Digital Ocean no cuenta con la promoción de $200 créditos, por lo tanto no se realizó el despliegue de la base de datos en dicha plataforma, pero se puede hacer uso de Railway, con la cual se puede usar $5 o 500 horas de ejecución al mes de manera gratuita.

En Digital Ocean creamos un nuevo proyecto desde el dashboard, al cual le indicamos que el proyecto tiene como propósito un proyecto de clase o con propósitos educativos. A continuación vamos a la sección de Databases y creamos un nuevo cluster de base de datos. Por defecto dejamos la región que aparece, seleccionamos la maquina de base de datos, seleccionamos el plan económico, asignamos el nombre del cluster, seleccionamos el proyecto, asignamos los tags de manera opcional y finalizamos la creación del cluster.

Una de las configuraciones importantes, es la restricción de la conectividad a IPs no deseadas, por el momento continuamos sin seguridad. El paso siguiente es obtener los datos de conexión al cluster, mediante una red pública.

Los pasos anteriores se realizan mientras se crea el cluster, en la siguiente lección vamos a probar la base de datos una vez creada.

> Advertencia: Siempre es importante bajar los servicios cada que no los estemos usando, con el fin de evitar cobros a la tarjeta, por ejecución de los mismos.

## Probar la Base de Datos

Vamos a probar la base de datos Postgres que conectaremos a nuestra API. Lo primero será ingresar a la sección de Databases dentro del proyecto en Digital Ocean, luego seleccionamos el cluster creado, pasamos a la sección de usuarios y creamos uno nuevo, por defecto se genera una contraseña para el nuevo usuario. Dentro de la sección de bases de datos, añadimos una con el objetivo de conectarla a nuestro proyecto.

Volvemos a la pestaña de Overview dentro del cluster, y en los detalles de conexión, seleccionamos al nuevo usuario y tendremos los datos con los cuales nos podemos conectar. Es importante resaltar que la conexión con el cluster requiere la configuración SSL (certificado de Secure Sockets Layer), por lo que debemos volver a activar dicha configuración dentro del archivo `app.module.ts` de nuestra aplicación.

```ts
@Module( {
    imports: [
        ConfigModule.forRoot(),

        TypeOrmModule.forRoot( {
          ssl: process.env.STAGE === 'prod',
          extra: {
                ssl: process.env.STAGE === 'prod'
                    ? { rejectUnauthorized: false }
                    : null,
            },
            ...
        })
        ...
    ],
} )
export class AppModule { }
```

También es bueno intentar que nos conectemos a la base de datos desde una aplicación de terceros, como por ejemplo TablePlus.

## Conectar contenedor con la base de datos

Para conectar nuestra base de datos al contenedor de la API, requerimos hacer algunas actualizaciones dentro del archivo `.env`, por ejemplo, la variable `STAGE=testing`, pasará a ser `STAGE=prod`, esto con la intención de que la configuración de la lección pasada sea reconocida. Las demás variables se deben actualizar con los datos de conexión al cluster y base de datos en Digital Ocean (o en Railway como es mi caso).

Con lo anterior actualizado, debemos modificar el archivo de docker-compose, ya que no necesitamos el servicio de la base de datos:

```yaml
version: '3'

services:
    app:
        image: <username>/teslo-shop:1.0.1
        restart: always
        container_name: teslo-backend
        ports:
            - ${PORT}:${PORT}
        environment:
            APP_VERSION: ${APP_VERSION}
            STAGE: ${STAGE}
            DB_PASSWORD: ${DB_PASSWORD}
            DB_NAME: ${DB_NAME}
            DB_HOST: ${DB_HOST}
            DB_PORT: ${DB_PORT}
            DB_USERNAME: ${DB_USERNAME}
            PORT: ${PORT}
            HOST_API: ${HOST_API}
            JWT_SECRET: ${JWT_SECRET}
```

Otra configuración a tener en cuenta, es la actualización de la imagen con el nuevo cambio mencionado en la lección anterior dentro de Docker Hub, por lo que volvemos a ejecutar el comando de construcción de la imagen, especialmente el que nos ayuda en la definición de la imagen para múltiples arquitecturas. (Recomendable que le subamos un número a la versión de acuerdo al standard de control de versiones semántico)

## Prueba local de la nueva imagen

Cómo ya actualizamos la imagen, y la enviamos al repositorio de Docker Hub, lo usaremos dentro del servicio app del docker-compose, y luego podemos usar el endpoint `http://localhost:3000/api/seed` para poblar la base de datos.

Si observamos la base de datos en la plataforma Digital Ocean o Railways, podremos observar que la base de datos ha sido poblada correctamente.

## Desplegar la imagen directamente desde Docker Hub

Podemos desplegar la imagen de nuestro proyecto desde Docker Hub hacía Digital Ocean, para lo cual vamos al Dashboard de nuestro proyecto en Digital Ocean, y en la opción de Apps creamos una nueva app y seleccionamos el provisionador del servicio, en este caso Docker Hub, el cual funciona solo con proyectos públicos, adjuntamos el enlace del repositorio y de manera opcional podemos definir el tag de la imagen. Lo siguiente es configurar las variables de entorno globales de la imagen, en este caso son las que definimos dentro de nuestro archivo `.env`. Seguido a ello podemos añadir algunas configuraciones extra como las configuraciones de los costos entre otros.

## Crear registro y desplegar imagen en él

Para el despliegue de la imagen desde Docker Hub a Digital Ocean, los repositorios deben ser públicos, pero si queremos que la imagen sea privada, lo que haremos es usar la sección de Container Registry con el objetivo de manejar un repo privado.

Una vez creado el contenedor de registro, vamos a usar el API Token, por lo que creamos una clave secreta para el ingreso. Luego usamos el comando de `docker login registry.digitalocean.com` con las credenciales de nombre de usuario y password siendo reemplazadas por el API Token. Las demás configuraciones son por defecto, o personalizadas de acuerdo a nuestras necesidades.

## Subir imagen al registro

Digital Ocean nos pide que una vez autenticados, usemos el comando `docker tag <my-image> registry.digitalocean.con/<my-register>/<my-image>` con el fin de renombrar la imagen que vamos a subir, luego la cargamos con `docker push registry.digitalocean.com/<my-registry>/<my-image>`.

También podemos usar BuildX con el fin de cargar la imagen en diversas arquitecturas, lo único que se debe tener en cuenta es que se debe seguir el patron de `egistry.digitalocean.com/<my-registry>/<my-image>` en el nombre de la imagen.
