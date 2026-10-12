 <img src="imgs/logo.png" alt="Salida httpd" width="100">

# URL del curso:
* Clase 1: https://www.youtube.com/watch?v=qHYi92zRn-s
* Clase 2: https://www.youtube.com/watch?v=hzQNE092cW0
* Clase 3: https://www.youtube.com/watch?v=R1UGk4rb9BM 

# Instalacion
Es requisito previo tener instalado:
* Node
* NPM

# Consideracionse
A lo largo de este curso utilizaremos WARP como terminal (mas versatil que PowerShell o CMD)

# Navegacion
Una vez instalado Opencode y sus dependencias, abrir una terminal (Warp / Powershell / CMD) y escribir `opencode`, para que nos abra su terminal.

*   Si quiero salir de Opencode para volver a la terminal, `exit`. El problema es que si salgo y vuelvo a entrar, entro a un sesión vacía. Ver seccion `/session` del proximo apartado.

*   Para ver la totalidad de cosas que podemos hacer dentro de la terminal de Opencode, alcanza con escribir `/` para que se nos abra un menu con todas las opciones (te moves con la flecha o el mouse). Ejemplos:
    * `/models` → Selecciona los modelos a utilizar en cada proveedor de IA 
    Al lado de la palabra 'Build' o 'Plan' (dependiendo si estoy en modo agente o planificacion), deberia aparecer el nombre del modelo seleccionado. En el resto de este curso utilizaremos "Nemotron 3 Ultra Free". Si son modelos pagos, tambien se debera elegir el nivel de esfuerzo que le vamos a pedir a exigir a ese agente (mayor complejidad de la tarea → mayor esfuerzo → mayor consumo de tokens).
    * `/help` → Guía de referencia rápida y catálogo de funciones 
    * `/connect` → Selecciona los proveedores de IA a utilizar 
    * `/session` → Me permite elegir una sesión iniciada previamente (por ejemplo, termine de trabajar el dia t, pero el dia t+5 quiero seguir usando la misma sesion que use el dia t).
    * `/init` → Analiza el proyecto y genera automáticamente el archivo `AGENTS.md`
    * `/agents` o TAB → Cambia entre modo Build y Plan 
    * `/status` → Ver el estado de la sesión 
    * `/new` → Abre un nuevo chat 
    * `/compact` → Compacta la sesión 
    * `/undo` → Deshace los cambios impactados a partir del ultimo prompt
    * `/redo` → Rehace un mensaje 
    * `/diff` → Muestra los cambios en un archivo de código luego del ultimo cambio 
    * `@` → Referencia a ficheros, carpetas, skills, etc (ejemplo de prompt: modifica el archivo `@intex.html` en base a lo siguiente...)
    * `!` → Modo Shell, ejecuta comandos de terminal sin salir de OpenCode (es un atajo para evitar abrir una nueva terminal)
    * `CTRL + P` → Muestra en detalle todos los comandos de OpenCode 
    * `CTRL + T` → Cambia el nivel de esfuerzo del modelo de IA elegido 

# Context Engineering
*   <b>Arnes (harness)</b>: El sistema que rodea al modelo y le permite actuar como agente (gestiona contexto, herramientas y ejecucion de tareas).

*   <b>Guardarrailes</b>: Reglas y controles que limitan sus acciones y validan sus resultados (permisos, aprobaciones y comprobaciones de seguridad).

*   <b>Contexto</b>: Es la información que tiene disponible para realizar una tarea (instrucciones, conversación, archivos, documentación y resultados de herramientas).

*   <b>Agents.md</b>: Es un estándar de documentación diseñado para guiarse en proyectos donde intervienen agentes de Inteligencia Artificial o  desarrolladores humanos que colaboran con asistentes IA. A diferencia del clásico README.md (pensado principalmente para personas), el AGENTS.md proporciona instrucciones directas, directrices de arquitectura y reglas de contexto sobre cómo la IA debe leer, modificar, probar o generar código en ese repositorio. Debe incluir:
    *   Contexto minimo (dos o tres frases) sobre lo que tiene que hacer
    *   Stack y estructura
    *   Patrones
    *   Prohibiciones
    *   Estructura del proyecto
    *   Reglas de dominio / trampas conocidas
    *   Flujo  de trabajo
    *   Limites
    *   Verificacion
    *   Estilo de commits y PRs.

    El archivo se puede hacer manualmente o mediante `/init`:
    *   Lo crea vacio si el proyecto esta vacio.
    *   Lo crea con contenido, en funcion de los archivos existentes en el proyecto (sera necesario editarlo para agregarle/quitarle cosas).

    No importa la intefaz que este utilizando, el agente antes de hacer ejecutarse, siempre va a leer el `AGENTS.md`.

    Cuanto mejor condensado este el archivo mejor (no sobrecargarlo).


    SEGUIR DESDE MINUTO 59 - CLASE 1
