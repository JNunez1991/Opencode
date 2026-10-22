 <img src="imgs/logo.png" alt="Salida httpd" width="100">

# URL del curso:
* Clase 1: https://www.youtube.com/watch?v=qHYi92zRn-s
* Clase 2: https://www.youtube.com/watch?v=hzQNE092cW0
* Clase 3: https://www.youtube.com/watch?v=R1UGk4rb9BM 

# Instalacion
Es requisito previo tener instalado:
* Node
* NPM

~ CLASE 1 ~

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
    * `/update` → Actualiza Opencode en caso que haya salido alguna nueva version
    * `@` → Referencia a ficheros, carpetas, skills, etc (ejemplo de prompt: modifica el archivo `@intex.html` en base a lo siguiente...)
    * `!` → Modo Shell, ejecuta comandos de terminal sin salir de OpenCode (es un atajo para evitar abrir una nueva terminal)
    * `CTRL + P` → Muestra en detalle todos los comandos de OpenCode 
    * `CTRL + T` → Cambia el nivel de esfuerzo del modelo de IA elegido 

# Context Engineering
*   <b>Arnes (harness)</b>: El sistema que rodea al modelo y le permite actuar como agente (gestiona contexto, herramientas y ejecucion de tareas).

*   <b>Guardarrailes</b>: Reglas y controles que limitan sus acciones y validan sus resultados (permisos, aprobaciones y comprobaciones de seguridad).

*   <b>Contexto</b>: Es la información que tiene disponible para realizar una tarea (instrucciones, conversación, archivos, documentación y resultados de herramientas).

*   <b>AGENTS.md</b>: Es un estándar de documentación diseñado para guiarse en proyectos donde intervienen agentes de Inteligencia Artificial o desarrolladores humanos que colaboran con asistentes IA. A diferencia del clásico README.md (pensado principalmente para personas), el AGENTS.md proporciona instrucciones directas, directrices de arquitectura y reglas de contexto sobre cómo la IA debe leer, modificar, probar o generar código en ese repositorio. Debe incluir:
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
    *   Lo crea con contenido, en funcion de los archivos existentes en el proyecto (analiza el proyecto y crea el archivo - sera necesario editarlo para agregarle/quitarle cosas).

    No importa la intefaz que este utilizando, el agente antes de hacer ejecutarse, siempre va a leer el `AGENTS.md`.

    Cuanto mas condensado este el archivo mejor (no sobrecargarlo).

* <b>MEMORY.md</b>: La memoria de los agentes es finita. Si desarrollo mucho, la memoria acaba llenandose. Este archivo, permite reflejar cosas que quiero guardar de manera persistente. Hay cosas que quizas no son tan importantes como para guardarlas en el AGENTS.md, pero que son lo suficiente importantes como para que el agente las olvide. La idea es conectar este archivo al AGENTS.md, de forma que cada vez que le pido al agente que haga algo, analice primero el AGENTS.md, y luego el MEMORY.md.
No es un estándar, es documentación extra.<br>
Para conectar este archivo con el de AGENTS.md, alcanza con crear una sección dentro de él bajo el titulo Memoria, y algunas especificaciones.
        

# Build / Plan (Opencode)
* Si mi terminal de opencode se encuentra en modo `Build`, cada instrucción que yo le de el agente se va a ejecutar
* Si mi terminal de opencode se encuentra en modo `Plan`, no construye nada, sino que me permite trabajar en conjunto con el agente para determinar el mejor plan para llevar a cabo la tarea. El modo plan conviene utilzarlo para tareas grandes o refactor.

Para cambiar entre ambos modos, SHIFT + TAB.

~ CLASE 2 ~

# Comandos personalizados
Es un prompt reutilizable que ejecutas escribiendo /command. Permite repetir tareas habituales sin volver a escribir las instrucciones. <br>
Creacion:
1. En la raiz del proyecto, crear la carpeta `.opencode` → dentro de ella crear la carpeta `commands`. La carpeta `.opencode` no es un estandar, se utiliza para configuraciones propias de opencode.
2. Dentro de la subcarpeta `commands`, crearemos los `.md` de cada comando personalizado que necesitemos. Importante, el nombre del archivo sera exactamente el nombre con el que lo voy a llamar. El archivo debe contener lo siguiente:
    -   Descripcion: Resumir brevemente que hace ese comando
    -   agent: Si el agente sera de `Build` o `Plan`
    -   Contexto: Toda la descripcion de lo que debe realizar
3. Reiniciar opencode y ejecutarlo (`/restart` - `/exit`)
4. Documentacion oficial: https://opencode.ai/docs/commands/

Se sugiere crear comandos solamente en aquellos casos donde las instrucciones que le doy se vuelven repetitivas (cada cierto tiempo le digo que haga la misma tarea). <br>

<b>Utilizacion</b><br>
Una vez creado el comando, alcanza con situar a opencode sobre la raiz del proyecto y llamar al comando `/feature` (asumiendo que lo llame feature.md). Deberia tambien poder verse la breve descripcion de que es lo que hace.

```opencode
/feature mostrar el total de minutos estudiados esta semana 
```
Una vez comience, es probable que nos haga preguntas respecto al curso de accion que voy a querer ir tomando para implementar esos cambios. Es posible que en cierto momento te diga que no puede aplicar los cambios porque, en este ejemplo, esta en modo `Plan`, por ende sera necesario cambiar a `Build`.

Recordar que para ver todos los cambios implementados, se puede hacer un `/diff`.


# Skills
Conjunto de instrucciones reutilizables que enseña al agente como realizar una tarea concreta. El agente puede cargar las instrucciones completas cuando las necesita (o utilizando / o @).

## Skils propias
Creacion:
1. En la raiz del proyecto crear la carpeta `.agents`, y dentro de ella crear una subcarpeta `skills`. 
2. Dentro de `skills` voy a crear tantas carpetas como skills necesite. Cada carpeta con debera recibir el nombre que tendra la skill.
3. Dentro de cada subcarpeta, se alojara el fichero `SKILL.md` con las instrucciones de la skill. Todas las skill deben tener esta estructura (quien define el nombre de la skill, es la subcarpeta).
4. El formato del `SKILL.md` es muy parecido al utilizado al crear los comandos.
5. Recordar hacer un `/restart`.
6. Buscar la skill creada en `/skills`.

La diferencia con los comandos es que el agente automaticamente va a conocer la existencia de sus skills, y sera el quien decida cual o cuales va a utilizar. Con la skill le doy la habilidad, pero no lo obligo a utilizarla. Respecto a los comandos, soy yo como usuario que decido cuando utilizarlo y cuando no.

Ejemplo:
Le pido al agente que trabaje de cierta manera con las fechas. El agente primero se va a preguntar si tiene alguna habilidad que le permita hacerlo. Luego sera el quien decida si la utiliza o no. Voy a crear una nueva funcionalidad que me devuelva cuantos dias llevo estudiados este mes
```opencode
/feature quiero mostrar cuantos dias he estudiado este mes. ¿Vas a utilizar alguna skill?
```
Deberia ver en el log de opencode que el agente llamar al skill creado para manejar fechas.

## Skills de terceros
seguir desde el minuto 25