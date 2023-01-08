# Sección 01: Introducción

## Instalación Docker - Linux Ubuntu

Para realizar la instalación de Docker Desktop en Linux Ubuntu debemos tener en cuenta que hace uso de un KVM virtualization con el fin de mantener una interfaz común para todos los sistemas operativos habilitados para la plataforma. Para Ubuntu se debe hacer uso de un paquete DEB y dentro de una terminal copiamos los siguientes comandos:

- Remover versiones anteriores:

  ```txt
  $: rm -r $HOME/.docker/desktop

  $: sudo rm /usr/local/bin/com.docker.cli

  $: sudo apt purge docker-desktop
  ```

- Instalar paquete DEB:

  ```txt
  $: sudo apt-get update

  $: sudo apt-get install ./docker-desktop-<version>-<arch>.deb

  $: docker container run hello-world
  ```

- Para abrir la aplicación se puede buscar desde el menú, o se puede ejecutar el siguiente comando:

  ```txt
  $: systemctl --user start docker-desktop
  ```

## Instalación Docker - Linux forma manual

En una maquina de Ubuntu podemos hacer la ejecución de la siguiente manera:

- Eliminar versiones anteriores de docker:
  
  ```txt
  $: sudo apt-get remove docker docker-engine docker.io containerd runc
  ```

- Instalar usando el repositorio:
  
  ```txt
  $: sudo apt-get update

  $: sudo apt-get install \
        ca-certificates \
        curl \ 
        gnupg \
        lsb-release
  
  $: sudo mkdir -p /etc/apt/keyrings

  $: curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

  $: echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  ```

- Instalar Docker Engine:
  
  ```txt
  $: sudo apt-get update

  $: sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

  $: sudo docker run hello-world
  ```

- Pasos post-instalación de Docker Engine:

  - Para usar Docker como un usuario no-root (es decir sin hacer uso de `sudo`), ejecutamos

    ```txt
    $: sudo groupadd docker

    $: sudo usermod -aG docker $USER

    $: newgrp docker

    $: docker run hello-world
    ```
