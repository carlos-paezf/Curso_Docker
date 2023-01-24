# Sección 10 - Introducción a Kubernetes - K8s

Esta sección pretende darles una idea de cómo funciona Kubernetes (K8s) y varios de sus componentes, puntualmente veremos:

- ¿Cuál es su objetivo?
- Configuraciones básicas
- Secretos y ConfigMaps
- Base64 encoded strings
- Deployments
- Agregar al cluster
- Minikube
- KubeCtl
- Replicas
- Kubernetes Docs
- Cleaning.

## Introducción a Kubernetes

Kubernetes es una plataforma para automatizar el despliegue, escala y manejo de contenedores, creado originalmente por Google, pero actualmente es de código libre.

Kubernetes resuelve problemas como:

- Los usuarios esperan un servicio 24/7
- Los de IT esperan hacer muchos despliegues en un día sin detener el servicio que está corriendo.
- Las compañías esperan mayor eficiencia de los recursos en la nube.
- Un sistema tolerante a fallas en el momento que algo salga mal
- Escalar hacia arriba o abajo según demanda.

Hay un termino conocido como ***Orquestación***, el cual hace manejo automático de aplicaciones en contenedores, nos ayuda a tener una alta disponibilidad, prácticamente no hay "downtimes" en reemplazos de versiones, y un fácil manejo de réplicas.

Kubernetes tiene 8 componentes principales:

1. ***Pod***, los cuales son los objetos implementables más pequeños en K8s, es una capa abstracta sobre uno o más contenedores, esto permite reemplazarlos fácilmente. Tienen una IP única asignada, que al reconstruirse cambia. En resumen, es una capa que se construye sobre los contenedores.
2. ***Service***, tienen una IP única asignada que resuelven la conexión y comunicación entre Pods. Existen los Internal Service y los External Service. Las IP es permanente y el ciclo de vida del POD y el Servicio son independientes. En resumen, permite la comunicación con direcciones fijas.
3. ***Ingress***, reciben las solicitudes que llegan a los puertos expuestos y que deben ser enviados a los servicios. Se puede decir que, trabaja con el tráfico externo que viaja hacía adentro del cluster.
4. ***ConfigMap***, podemos verlo como las variables de entorno que no son privadas, por ejemplo la URL de la base de datos.
5. ***Secret***, son parecidos al anterior pero con seguros. K8s no encripta, por lo que los valores que se almacenen ya deben estar ofuscadas
6. ***Volume***, son el almacenamiento en una máquina local, o lugar remoto fuera de cluster de K8s, el cual no maneja la persistencia de la data.
7. ***Deployment***, es el plano o "Blueprint" para crear todo POD y la cantidad de replicas. Aquí es donde se puede escalar hacia arriba o hacia abajo la cantidad de replicas.
8. ***StatefulSet***, es el plano similar a los deployments, pero para bases de datos principalmente, no podemos replicar las bases de datos.

Los ***Clusters*** son un grupo de nodos que corren aplicaciones en contenedores de una forma eficiente, automatizada, distribuida y escalable.

## Instalación y configuración de MiniKube

Vamos a usar [Minikube](https://minikube.sigs.k8s.io/docs/start/), es cual puede ser configurado rápidamente desde Docker Desktop al momento de activar Kubernetes. Para instalarlo de manera manual requerimos tener manejadores de contenedores y/o maquinas virtuales, lo cual ya tenemos con Docker. Para la descarga, podemos seleccionar el OS, arquitectura, release type y tipo de instalador deseado. En mi caso usare Windows x86-64, release Stable, y Windows Package Manager por lo que hago uso del siguiente comando:

```txt
$: winget install minikube
```

Para comprobar la instalación, usamos el siguiente comando (en ocasiones toca reiniciar el equipo para que reconozca la instalación):

```txt
$: minikube version
```

Para empezar el cluster en minikube usamos el comando:

```txt
$: minikube start
```

Una vez terminada la ejecución del comando, observaremos que tenemos un contenedor con varios puertos expuestos. Si queremos eliminar todo, entonces usamos el siguiente comando:

```txt
$: minikube delete --all
```

## ConfigMap

Vamos a crear un nuevo directorio llamado `k8s-teslo`, y tendremos en cuenta la documentación de [Kubernetes](https://kubernetes.io/es/docs/concepts/). Vamos a iniciar con la base de datos, normalmente lo aprovisionaríamos desde algún servicio mediante una cadena de conexión, pero en esta ocasión vamos a hacerlo desde un configMap llamado `postgres-config.yaml`, dentro del cual tendremos un pares de llave-valor con los datos que no requiero ofuscar:

```yaml
apiVersion: v1

kind: ConfigMap

metadata:
    name: postgres-config

data:
    DB_NAME: postgres
    DB_HOST: postgres-service
    DB_PORT: "5432"
```

## Secrets

Hay elementos para la base de datos que necesitamos que sean secretos, para este caso vamos a crear un archivo llamado `postgres-secrets.yaml` (el nombre del archivo solo se usa como indicador para el programador, el verdadero nombre que importa es el que se define en `metadata`).

```yaml
apiVersion: v1

kind: Secret

metadata:
    name: postgres-secrets

type: Opaque

data:
    DB_USER: postgres
    DB_PASSWORD: <Password>
```

Es importante tener en cuenta que para los secretos necesitamos tener una encriptacion tipo Base64, en este caso vamos a usar [Code Beautify](https://codebeautify.org/base64-encode) para codificar nuestros secretos en Base64. Una vez encriptados los datos, los asignados a los secretos del archivo:

```yaml
...
data:
    DB_USER: cG9zdGdyZXM=
    DB_PASSWORD: PFBhc3N3b3JkPg==
```

También podemos usar la consola para convertir un string normal a un Base64:

```txt
$: echo -n postgres | base64
cG9zdGdyZXM=
```

## Pods, Services y Deployments

Vamos a crear un archivo llamado `postgres.yaml`, dentro del cual haremos el blueprint para el deployment:

```yaml
apiVersion: apps/v1

kind: Deployment

metadata:
    name: postgres-deployment

spec:
    replicas: 1
    selector:
        matchLabels:
            app: postgres
    template:
        metadata:
            labels:
                app: postgres
        spec:
            containers:
            - name: postgres
              image: postgres:15.1
              resources:
                limits:
                    memory: "128Mi"
                    cpu: "500m"
              ports:
              - containerPort: 5432
              env:
              - name: POSTGRESS_PASSWORD
                valueFrom:
                    secretKeyRef:
                        name: postgres-secrets
                        key: DB_PASSWORD
```

Ahora, para crear el servicio, el cual tendremos en el mismo archivo, haremos la siguiente configuración:

```yaml
apiVersion: v1

kind: Service

metadata:
    name: postgres-service

spec:
    selector:
        app: postgres
    ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
```

El nombre del servicio en la metadata es igual al que establecimos como host dentro del ConfigMap.
