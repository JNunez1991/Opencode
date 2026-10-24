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
Conjunto de skills compartidas creadas por la comunidad/empresas.
Vamos a utilizar la pagina: `skills.sh` como referencia.

Para mejorar la interfaz de la aplicacion, vamos a utilizar la skill: `frontend-desing` (revisar la cantidad de descargas para verificar que sea segura).

Para utilizarla, podriamos acceder al documento que genera la skill y hacer lo mismo que hicimos con la skill anterior. Sin embargo, existe un metodo mucho mas sencillo.
1. Comenzamos por instalar el CLI necesario: 
``` powershell
npx skills add vercel-labs/agent-skills
```
Este paso nos permite instalar Skills de terceros mediante un asistente (wizard).
2. Luego de culminada la instalacion, en el home de la pagina web buscamos la skill deseada: https://www.skills.sh/anthropics/skills/frontend-design
3. Copiar el comando de instalacion en una terminal de Powerswell: 
``` powershell
npx skills add https://github.com/anthropics/skills --skill frontend-design 
```
4. Una vez definido el scope de la skill (si se instala a nivel global o de proyecto), volvemos a opencode, la damos `/restart` y le damos una instruccion de que mejora la interfaz grafica. Podemos llamar la skill a mano mediante `@frontend-desing`, o dejar que el agente la encuentre solo.
``` powershell
@frontend-design con lo que sabes mejora el diseño
```
5. Deberia haberse modificado `MEMORY.md` con lo que haya aprendido a partir del skill.

### Skilss starter pack
- find-skills (Vercel): Busca e instala skills del ecosistema cuando necesitas una capacidad nueva.
- grill-me (Matt Pocock): Te hace preguntas sobre tu plan hasta cubrir todos los casos antes de implementar.
- frontend-design (Anthropic): Crea interfaces con un diseño cuidado y profesional
- web-design-guidelines (Vercel): Revisa la interfaz y detecta problemas de accesibildad, UX y diseño.
- systematic-debugging (Jesse Vincent): Depura con metodo (reproducir, aislar, formular hipotesis y verificar).

# MCP (Model Context Protocol)
Se ignora porque no lo veo relevante (comienza en el minuto 33.00 al 45.00)

# SDD (Spec Driven Development)
Desarrollo asistido por especificaciones.
Es una forma de desarrollar software en la que primero defines que debe hacer el sistema, sus requisitos, limites y criterios de aceptacion, y utilizas esa especificacion para guiar la implementacion y comprobar el resultado.
- <b>Flujo de desarrollo clásico</b><br> 
Análisis → Diseño → Implementacion → Validación → Despliegue / Mantenimiento → Repeticion
- <b>Flujo de desarrollo SDD</b><br> 
Especificación → Planificación → Implementacion → Validación → Despliegue / Mantenimiento → Repeticion

## Taxonomia SDD
Diferentes formas de entenderlo.
- <b>Spec-First</b>: Escribes la especificaciòn antes de programar, pero no necesariamente la mantienes despues (hago la especificación, se implementa, y luego la especificación muere).
- <b>Spec-anchored</b>: Conservas y actualizas la especificación para guiar la evolución del código.
- <b>Spec-as-source</b>: Editas unicamente la especificación y el código se genera a partir de ella y no se modifica manualmente.

## EARS (Easy Approach to Requirements Syntax)
Es una forma de escribir requisitos con planitllas fijas para que no sean ambiguos.
Funcionan bien con la IA porque:
- Cada requisito se puede verificar, asi que se convierte casi directamente en un test
- El 'si...entonces' obliga a pensar los errores, que es justo lo que la IA suele olvidar.
- Una frase = un comportamiento. Nada de parrafos donde el agente tenga que interpretar.

## SDD: Paso a paso 
El objetivo sera llegar a una estructura de este estilo:
```
project/ 
├── .agents/
├── .opencode/
├── AGENTS.md 
├── MEMORY.md 
├── docs/ 
│   └── constitution.md 
├── specs/ 
│   ├── 001-nombre-spec/ 
│   │   ├── spec.md 
│   │   ├── plan.md 
│   │   └── tasks.md 
│   ├── 002-nombre-spec/... 
│   └── 003-nombre-spec/... 
├── tests/ 
└── <CÓDIGO DEL PROYECTO>
```

1. <b>Constitución (una vez por proyecto)</b><br>
Como tenemos que acabar indicando de manera general cual es el fichero de conocimiento de nuestro agente → Crear carpeta `docs` en la raiz del proyecto, y dentro de ella, el archivo `constitution.md`.<br>
Si voy a trabajar con SDD, recordar agregar alguna referencia en el `AGENTS.md`.
Ejemplo: Prompt para generar el contenido del archivo <br>
> Vamos a crear la constitución del Diario de Estudio. Es un proyecto que ya existe: lee AGENTS.md, MEMORY.md y el código antes de proponer nada. Es un proyecto educativo que debe poder mantener alguien que empieza a programar. 
> Proponme un docs/constitution.md con 6 principios innegociables, cortos y verificables, que cubran: simplicidad del stack, relación entre spec y código,separación entre lógica e interfaz, política de tests (sin instalar dependencias), protección de los datos del usuario e idioma del código y los textos. Máximo 15 líneas. 
> Espera mi aprobación.

Si lo tengo muy claro, no preciso pasarle un prompt a la IA, lo hago a mano.

2. <b>Especificación `spec.md`</b><br>
Creamos la carpeta `specs` donde se van a incluir todas las especificaciones.
Cada especificacion va numerada en una carpeta y con un nombre representativo de lo que hace, por ejemplo, `001-heat-map/spec.md`
Ejemplo: Prompt para crear un spec <br>
> NO escribas código en ningún momento. Vamos a redactar la especificación de una nueva funcionalidad del Diario de Estudio. Lee docs/constitution.md. 
> Idea inicial: un mapa de calor tipo GitHub que muestre los días estudiados de las últimas  semanas, donde cuantos más minutos estudiados, más intenso es el color del día. 
> Tu trabajo: 
> 1-  Hazme preguntas de UNA en UNA para eliminar ambigüedades (casos límite,  comportamiento con errores, qué queda fuera de esta versión). Máximo 5 preguntas. 
> 2-  Con mis respuestas, genera specs/001-heat-map/spec.md con esta  estructura: contexto y objetivo, usuarios, historias de usuario, requisitos funcionales numerados (RF-x) con criterios de aceptación en notación EARS en español, requisitos no funcionales, casos límite, fuera de alcance, criterios de finalización y dudas abiertas marcadas como  [NECESITA ACLARACIÓN]. 
> 3- El QUÉ y el POR QUÉ. Nada de stack, arquitectura ni nombres de archivos:  eso irá en el plan. 

3. <b>Clarificación</b><br>
Utilizamos el propio agente para que revise la spec, porque muchas veces los modelos no son capaces de llegar a la mejor solucion a la primera.
Ejemplo: Prompt para revisar un spec
> Revisa specs/001-heat-map/spec.md como si fueras un QA muy profesional.  Lista: (1) ambigüedades restantes, (2) contradicciones entre requisitos, (3) casos límite no cubiertos, (4) conflictos con docs/constitution.md. No propongas soluciones todavía: solo detecta. Formato: lista numerada.

4. <b>Planificación `plan.md`</b><br>
Una vez que determinamos que la spec esta correcta, es momento de pasar a la etapa de implementacion.
Ejemplo: Prompt para la planificacion
> Lee docs/constitution.md y specs/001-heat-map/spec.md. NO escribas código. Genera specs/001-heat-map/plan.md con: qué archivos se crean o modifican y qué responsabilidad tiene cada uno, qué funciones puras de lógica se necesitan (con "hoy" como parámetro), algoritmo del mapa en pseudocódigo, cómo se pinta en la interfaz, decisiones técnicas justificadas (y su  alternativa descartada) y estrategia de tests con node --test. Todo debe respetar la constitución y cubrir todos los RF. Marca qué RF cubre cada parte.

SEGUIR DESDE 1.03

5. <b>Tareas `tasks.md`</b><br>
6. <b>Implementación</b><br>
7. <b>Validación</b><br>
8. Loop al paso 2 (mantenimiento)
