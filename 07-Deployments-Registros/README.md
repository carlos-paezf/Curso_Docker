# Sección 07: Deployments y Registros

## Construcción de imagen, múltiples arquitecturas

Vamos a usar el ejercicio de `teslo-shop` de la sección anterior. Lo primero que haremos es crear un repositorio en Docker Hub en el cual subiremos la imagen que vamos a generar, luego vamos a usar BuildX para construir la imagen en múltiples arquitecturas:

```txt
$: docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t carlospaezf/tesla-shop:1.0.0 --push .
```

Puede que se demore un poco más de lo normal debido a la cantidad de arquitecturas que se especifiquen, y del tamaño del proyecto. Otro aspecto que debemos tener en cuenta, es que podemos personalizar mediante lenguaje Markdown la descripción del repositorio en Docker Hub. Por ejemplo mediante una tabla se pueden mostrar mediante clave-valor las variables de entorno que se deben definir en nuestra imagen.
