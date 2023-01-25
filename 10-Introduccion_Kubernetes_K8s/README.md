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

## Desplegar la base de datos en el cluster

Vamos a crear ina instancia de la terminal dentro del directorio `k8s-teslo`. Lo primero es asegurarnos que kubectl se encuentre instalado con el siguiente comando:

```txt
$: kubectl version --short
```

A continuación vamos a ejecutar todos los archivos que creamos dentro del directorio, mientras haya referencias, debemos ejecutar los yaml en orden con el fin de no romper las dependencias.

Para conocer la información acerca de nuestro cluster usamos el siguiente comando:

```txt
$: kubectl get all
NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   83m
```

Comenzamos la aplicación de los archivos:

```txt
$: kubectl apply -f postgres-config.yaml
configmap/postgres-config created

$: kubectl apply -f postgres-secrets.yaml
secret/postgres-secrets created

$: kubectl apply -f postgres.yaml
deployment.apps/postgres-deployment created
service/postgres-service created
```

Cuando usamos el comando `kubectl get all` para observar los componentes, obtenemos la siguiente salida:

```txt
$: kubectl get all
NAME                                      READY   STATUS              RESTARTS   AGE
pod/postgres-deployment-678b4c7dd-95cf9   0/1     ContainerCreating   0          54s

NAME                       TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)    AGE
service/kubernetes         ClusterIP   10.96.0.1     <none>        443/TCP    85m
service/postgres-service   ClusterIP   10.105.41.2   <none>        5432/TCP   55s

NAME                                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/postgres-deployment   0/1     1            0           55s

NAME                                            DESIRED   CURRENT   READY   AGE
replicaset.apps/postgres-deployment-678b4c7dd   1         1         0       55s
```

Cuando hay un elemento que tenga el valor de `0/1` o un patron similar en la columna de `READY`, significa que aún no están listos todos los procesos, y mediante el valor de la columna `STATUS` sabremos en que etapa se encuentra el elemento. Si en un tiempo prudente ejecutamos de nuevo el mismo comando de arriba, debemos obtener el `1/1`, o de lo contrario nos debe indicar el `STATUS` que ha ocurrido un error.

Para verificar si algo ha salido mal, o saber el estado de un elemento, usamos el siguiente comando:

```txt
$: kubectl describe <nombre del elemento>
```

Por ejemplo para el elemento `pod/postgres-deployment-678b4c7dd-95cf9` de la lista impresa:

```txt
$: kubectl describe pod/postgres-deployment-678b4c7dd-95cf9
Name:             postgres-deployment-678b4c7dd-95cf9
Namespace:        default
Priority:         0
Service Account:  default
Node:             minikube/<IP>
Start Time:       Tue, 24 Jan 2023 15:45:31 -0500
Labels:           app=postgres
                  pod-template-hash=678b4c7dd
Annotations:      <none>
Status:           Pending
IP:               <IP>
IPs:
  IP:           <IP>
Controlled By:  ReplicaSet/postgres-deployment-678b4c7dd
Containers:
  postgres:
    Container ID:
    Image:          postgres:15.1
    Image ID:
    Port:           5432/TCP
    Host Port:      0/TCP
    State:          Waiting
      Reason:       ImagePullBackOff
    Ready:          False
    Restart Count:  0
    Limits:
      cpu:     500m
      memory:  128Mi
    Requests:
      cpu:     500m
      memory:  128Mi
    Environment:
      POSTGRESS_PASSWORD:  <set to the key 'DB_PASSWORD' in secret 'postgres-secrets'>  Optional: false
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-69xtn (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             False
  ContainersReady   False
  PodScheduled      True
Volumes:
  kube-api-access-69xtn:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
QoS Class:                   Guaranteed
Node-Selectors:              <none>
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type     Reason     Age                   From               Message
  ----     ------     ----                  ----               -------
  Normal   Scheduled  8m37s                 default-scheduler  Successfully assigned default/postgres-deployment-678b4c7dd-95cf9 to minikube
  Warning  Failed     2m1s (x3 over 6m37s)  kubelet            Failed to pull image "postgres:15.1": rpc error: code = Unknown desc = context deadline exceeded
  Warning  Failed     2m1s (x3 over 6m37s)  kubelet            Error: ErrImagePull
  Normal   BackOff    94s (x4 over 6m36s)   kubelet            Back-off pulling image "postgres:15.1"
  Warning  Failed     94s (x4 over 6m36s)   kubelet            Error: ImagePullBackOff
  Normal   Pulling    79s (x4 over 8m36s)   kubelet            Pulling image "postgres:15.1"
```

Para conocer los logs del elemento cambiamos `describe` por `logs`

## Agregar PG-Admin al cluster

Vamos a instalar el servicio de PG-Admin, para lo cual primero vamos a configurar primero los secretos en nuevo archivo llamado `pg-admin-secrets.yaml`:

```yaml
apiVersion: v1

kind: Secret

metadata:
    name: pg-admin-secrets

type: Opaque

data:
    # echo -n superman@mail.com | base64
    PG_USER_EMAIL: c3VwZXJtYW5AbWFpbC5jb20=
    # echo -n Password | base64
    PG_PASSWORD: UGFzc3dvcmQ=
```

Luego creamos el archivo `pg-admin.yaml` y añadimos la siguiente configuración:

```yaml
apiVersion: apps/v1

kind: Deployment

metadata:
    name: pg-admin-deployment

spec:
    replicas: 1
    selector:
        matchLabels:
            app: pg-admin
    template:
        metadata:
            labels:
                app: pg-admin
        spec:
            containers:
            - name: pg-admin
              image: dpage/pgadmin4:6.17
              ports:
              - containerPort: 80
              env:
              - name: PGADMIN_DEFAULT_PASSWORD
                valueFrom:
                    secretKeyRef:
                        name: pg-admin-secrets
                        key: PG_PASSWORD
              - name: PGADMIN_DEFAULT_EMAIL
                valueFrom:
                    secretKeyRef:
                        name: pg-admin-secrets
                        key: PG_USER_EMAIL
              - name: PGADMIN_CONFIG_ENHANCED_COOKIE_PROTECTION
                value: "False"

---

apiVersion: v1

kind: Service

metadata:
    name: pg-admin-service

spec:
    type: NodePort
    selector:
        app: pg-admin
    ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30200
```

## Desplegar PG-Admin al cluster

Para añadir el nuevo servicio al cluster, debemos ejecutar los siguientes comandos:

```txt
$: kubectl apply -f pg-admin-secrets.yaml

$: kubectl apply -f pg-admin.yaml
```

Cuando tenemos un cambio dentro del archivo, debemos volver a aplicar los cambios mediante el comando `kubectl apply -f <file>`.

Si tratamos de ingresar a `localhost:30200`, no se podrá conectar a nada de lo esperado de PGAdmin, pero no es motivo de preocupación, puesto que, debemos exponer el servicio al entorno de nuestro equipo, y en esta ocasión lo hacemos con fines educativos:

```txt
$: minikube service pg-admin-service
```

Ahora si podemos acceder y trabajar con PGAdmin a `localhost:80` puesto que se ha aplicado un acceso por túnel, pero recordando que al no tener volúmenes, no podremos persistir la data del contenedor.

## Agregar el BackendApp al Cluster

Vamos a usar la imagen [klerith/k8s-teslo-backend](https://hub.docker.com/r/klerith/k8s-teslo-backend) en la version 1.1.0, y renombramos el archivo `pg-admin-secrets.yaml` por `backend-secrets.yaml` y lo más importante, cambiar el nombre dentro de la sección de metadata:

```yaml
...
metadata:
    name: backend-secrets
...
```

Otra nueva configuración, es añadir la clave secreta para JWT. Aplicamos también el cambio de nombre para el archivo donde tenemos el deploy y el service, pasamos de `pg-admin.yaml` a `backend.yaml`. Reemplazamos la imagen de dpage/pgadmin por klerith/k8s-teslo-backend, el puerto del contenedor, y las variables de entorno:

```yaml
apiVersion: apps/v1

kind: Deployment

metadata:
    name: backend-deployment

spec:
    replicas: 2
    selector:
        matchLabels:
            app: backend
    template:
        metadata:
            labels:
                app: backend
        spec:
            containers:
            - name: backend
              image: klerith/k8s-teslo-backend:1.1.0
              ports:
              - containerPort: 3000
              env:
              - name: APP_VERSION
                value: "1.1.0"
              - name: PORT
                value: "3000"
              - name: STAGE
                value: "prod"
              - name: DB_NAME
                valueFrom:
                    configMapKeyRef:
                        name: postgres-config
                        key: DB_NAME
              - name: DB_HOST
                valueFrom:
                    configMapKeyRef:
                        name: postgres-config
                        key: DB_HOST
              - name: DB_PORT
                valueFrom:
                    configMapKeyRef:
                        name: postgres-config
                        key: DB_PORT
              - name: DB_USERNAME
                valueFrom:
                    secretKeyRef:
                        name: postgres-secrets
                        key: DB_USERNAME
              - name: DB_PASSWORD
                valueFrom:
                    secretKeyRef:
                        name: postgres-secrets
                        key: DB_PASSWORD
              - name: JWT_SECRET
                valueFrom:
                    secretKeyRef:
                        name: backend-secrets
                        key: JWT_SECRET

---

apiVersion: v1

kind: Service

metadata:
    name: backend-service

spec:
    type: NodePort
    selector:
        app: backend
    ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
      nodePort: 30300
```

## Desplegar Backend al cluster

Vamos a desplegar los secrets y el deployment de la nueva imagen:

```txt
$: kubectl apply -f backend-secrets.yaml

$: kubectl apply -f backend.yaml
```

Con la aplicación podemos hacer el `describe` para saber lo que contiene el pod, y observar los `logs` con los outputs del mismo. Si queremos aplicar un cambio en cualquiera de los archivos, debemos realizar el `apply` de los nuevos cambios, pero para relanzar el servidor backend con los nuevos cambios debemos usar el comando:

```txt
$: kubectl rollout deployment <nombre del deployment>
```

## Probar backend y limpieza

Vamos a exponer el servicio del backend con el comando:

```txt
$: minikube service backend-service
```

Lo anterior nos abre de manera inmediata una pestaña en el navegador, en la cual podemos navegar a la documentación que se encuentra en `localhost:<port>/api` y ejecutar la sentencia de seed.

Nosotros le cambiamos el nombre al archivo de `pg-admin-secrets.yaml` a `backend-secrets.yaml`, e igualmente al deployment, pero nunca lo eliminamos del cluster, por lo tanto tenemos acceso aún a ese servicio y por lo tanto lo podemos exponer:

```txt
$: minikube service pg-admin-service
```

Para aplicar la limpieza del cluster usamos el siguiente comando:

```txt
$: minikube delete --all
```
