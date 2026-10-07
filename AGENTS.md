# AGENTS.md — Rouge Egg

Instrucciones para el agente de IA. Aplicar al inicio de cada consulta y antes de
modificar el proyecto.

## 0. Referencia rápida del proyecto

- **Juego:** *Rouge Egg* — acción y aventura *roguelike*. Un héroe se infiltra en la
  guarida de pollos mutantes y atraviesa mazmorras generadas al azar.
- **Stack:** JavaScript + NodeJS + Phaser de la línea 3.x (base acordada: andamiaje
  Vite + npm, dependencia `phaser` 3.90.0 exacta). Entorno verificado:
  Node v24.21.0, npm 11.19.0 (invocar vía `cmd /c npm` por la ExecutionPolicy que
  bloquea `npm.ps1`). Estado: andamiaje creado (`package.json`, `index.html`,
  `vite.config.js`, `src/main.js`, `src/scenes/GameScene.js`,
  `src/entities/Player.js`); `npm run build` verificado OK.
- **Documento principal de requisitos (GDD):** `DOCS/TP Final- Facundo Bastida.pdf`
  (citable por sección y página; todas las secciones están en la p. 2 según el
  índice). Antecedente: `DOCS/TP Final- Facundo Bastida.docx`. Ante diferencias,
  vale el PDF salvo indicación explícita del usuario.
- **Secciones reales del GDD:** Concepto; Controles del jugador (cuadrado azul);
  Objetivo del Juego; Mecánicas Principales; NPCs.
- **Reglas núcleo del GDD:** 5 niveles con dificultad progresiva; jugador con
  3 corazones de salud y 3 vidas (al agotarse la salud pierde una vida y reaparece
  con salud completa); subir de nivel por puntos otorga vida extra + elección de
  bonificación a estadísticas; puntuación, salud, experiencia y vidas persisten
  entre niveles; victoria al derrotar al jefe Pollo Morado al final del nivel 5.
  **Divergencia decidida por el usuario** (difiere del GDD, Objetivo, p. 2):
  la experiencia se eliminó como moneda; todo otorga puntos y el jugador sube
  de nivel cada 200 puntos (`src/balance.js`).
- **Enemigos (NPCs):** triángulos; la clase se distingue por color y tamaño.
  Rojos básicos (contacto); Naranjas perseguidores (persiguen en su área, se cansan
  y duermen, retoman si el jugador se acerca); Amarillos espadachines (espada que
  gira alrededor y ataque teledirigido cuando apunta al jugador); Verdes tóxicos
  (charcos de toxina que envenenan); Celestes pistoleros (mantienen distancia,
  disparan con cooldown, balas bloqueables por el arma); Azul mago helado
  (ralentiza al acercarse y golpea con su vara); jefe Morado (gran tamaño, dash
  esporádico hacia el jugador).
- **Controles PC vigentes (GDD, tabla de Controles):** Este = FLECHA DERECHA,
  Oeste = FLECHA IZQUIERDA, Norte = FLECHA ARRIBA, Sur = FLECHA ABAJO,
  Dash = Z, Ataque = X, Interactuar = C. Controles móviles: no definidos.
- **Gráficos:** estilo geométrico generado por código para entidades y mazmorra
  (jugador: cuadrado azul; enemigos: triángulos por color/tamaño) + dibujos de
  armas en `Assets/` (pixel-art blanco 128×128 pensado para tintes).
  Armas de enemigos con tinte del color de su clase (ej.: espada amarilla del
  espadachín). Jugador: espada larga en el golpe cuerpo a cuerpo, flechas como
  proyectiles; báculo reservado (mago). Carga vía imports de Vite en
  `GameScene.preload` + filtro NEAREST. No inventar nombres ni rutas.
- **Git:** repositorio inicializado con Git 2.55.0 (instalación por usuario),
  remoto `https://github.com/facbast/TP-Final---Bastida.git` (repo público
  existente, rama base `main`). Invocar vía
  `"$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"`. Rama de trabajo actual:
  `feature/base-juego` (con seguimiento a `origin/feature/base-juego`).
  Identidad local: `facbast` + email no-reply de GitHub.

## 1. Alcance y contexto

- Aplicar estas instrucciones al inicio de cada consulta y antes de modificar
  el proyecto.
- Responder en español y adaptar la profundidad del análisis a la complejidad
  de la solicitud.
- Identificar las rutas reales de la documentación; el documento principal es
  `DOCS/TP Final- Facundo Bastida.pdf`.
- Revisar la información vigente en cada consulta; no depender exclusivamente de
  resúmenes de conversaciones anteriores y repetir la revisión del código en cada
  tarea, sin asumir que la estructura sigue igual.
- Preservar el trabajo existente del usuario.

## 2. Revisar la documentación y el requisito

Antes de proponer o implementar una solución:

1. Identificar el requisito solicitado y su comportamiento esperado.
2. Revisar la carpeta `DOCS/` del proyecto.
3. Consultar las secciones pertinentes del GDD (`DOCS/TP Final- Facundo Bastida.pdf`):
   Concepto, Controles del jugador, Objetivo del Juego, Mecánicas Principales, NPCs.
4. Clasificar el requisito como:
   - **Definido:** la documentación describe suficientemente el comportamiento.
   - **Parcialmente definido:** está contemplado, pero faltan detalles necesarios.
   - **No definido:** no aparece en la documentación revisada.
   - **En contradicción:** la solicitud difiere de una regla documentada.
   - **No aplica:** consulta técnica o documental sin regla funcional asociada.
5. Citar documento y sección que respaldan el análisis. Para el PDF, indicar la
   página y distinguir la numeración del archivo de la numeración impresa si
   difieren (las secciones del GDD están en la p. 2 impresa según su índice).
6. Diferenciar las reglas documentadas de las propuestas y los supuestos.

Temas que el GDD no detalla (tratar como **No definido** o **Parcialmente
definido** según el caso, nunca como definidos): tesoros y trampas concretos,
umbrales de puntos/XP, estadísticas y bonificaciones elegibles, navegación entre
escenas, controles móviles, audio.

Si la documentación no existe o no puede leerse, indicarlo claramente y no afirmar
que el requisito está definido o ausente.

Un requisito no documentado puede ser una ampliación válida: identificarlo como tal
y consultar las decisiones necesarias.

No modificar la documentación de requisitos para justificar una implementación sin
solicitud explícita del usuario.

## 3. Analizar conflictos e impacto

Antes de modificar una funcionalidad:

- Revisar tanto las reglas documentadas como la implementación existente.
- Identificar dependencias, restricciones compartidas, excepciones, prioridades
  entre comportamientos y posibles regresiones.
- Analizar las interacciones con otras funcionalidades.
- Comparar el comportamiento actual con la documentación; no asumir que el código
  existente es necesariamente correcto.
- Detectar contradicciones internas de la documentación, incluidas diferencias
  entre texto, diagramas e imágenes.
- Comunicar los conflictos relevantes antes de modificar la parte afectada.

En este juego, considerar cuando corresponda:

- Movimiento y límites de la mazmorra; reglas de dash, ataque e interacción.
- Comportamientos enemigos y sus estados (persecución, cansancio/sueño,
  cooldowns de disparo, charcos de toxina, ralentización).
- Poderes, efectos, veneno, ralentización y bloqueo de balas.
- Salud (3 corazones), vidas (3), respawn, vida extra y bonificaciones por nivel.
- Niveles procedurales, persistencia entre niveles y condición de victoria
  (derrotar al Pollo Morado al final del nivel 5).
- Navegación de escenas y controles de PC y dispositivos móviles.

## 4. Preguntar antes de avanzar ante dudas

Cuando una duda afecte el alcance, las reglas, el comportamiento, la
compatibilidad o la implementación:

- Utilizar la herramienta de preguntas disponible en el entorno (`question`).
- Formular preguntas concretas.
- Explicar qué decisión falta y por qué importa.
- Ofrecer opciones cuando faciliten la decisión.
- Incluir una recomendación fundamentada cuando corresponda.
- Esperar la respuesta antes de adoptar una decisión que cambie el
  comportamiento solicitado.
- No inventar reglas para resolver omisiones o contradicciones.
- Continuar con tareas independientes cuyo alcance esté claro.

Si la herramienta de preguntas no está disponible, preguntar directamente en la
conversación y esperar la aclaración necesaria.

## 5. Utilizar POO y patrones de diseño

- Modelar entidades y comportamientos del dominio con programación orientada a
  objetos, respetando el lenguaje (JavaScript), el motor (Phaser) y la
  arquitectura del proyecto.
- Encapsular el estado y las reglas.
- Mantener responsabilidades claras, alta cohesión y bajo acoplamiento.
- Favorecer composición cuando evite jerarquías de herencia innecesarias.
- Separar la lógica de negocio (reglas, salud, niveles, IA enemiga) de la
  presentación (escenas, dibujado) y la entrada del usuario.
- Utilizar patrones de diseño cuando resuelvan una necesidad concreta.
- Explicar brevemente la elección y utilidad de los patrones aplicados.
- Evitar abstracciones innecesarias y refactorizaciones ajenas al requisito.

Patrones orientativos para este proyecto:

- **State** para estados del juego y de la IA enemiga (perseguir, cansarse,
  dormir, atacar).
- **Strategy** para comportamientos o efectos variables (tipos de enemigo,
  bonificaciones de nivel, efectos de veneno/ralentización).
- **Factory** para crear enemigos con variantes (color, tamaño, comportamiento).
- **Observer** para actualizar la interfaz (HUD de corazones, vidas, puntos)
  ante eventos del juego.

No imponer estos patrones cuando no aporten valor.

## 6. Reutilizar código existente

Antes de crear clases, componentes, servicios o utilidades:

1. Buscar implementaciones relacionadas.
2. Revisar sus contratos, comportamiento y consumidores.
3. Priorizar su reutilización o extensión cuando sean compatibles.
4. Evitar duplicar lógica de negocio.
5. Extraer lógica común cuando exista una necesidad real, preservando el
   comportamiento de sus consumidores.
6. Respetar las convenciones de estructura, nombres y estilo del proyecto.

Si no existe código reutilizable, indicarlo y diseñar una solución coherente con
el proyecto.

## 7. Recursos gráficos: geométricos + assets de armas

Las entidades y la mazmorra usan formas geométricas por código (estilo vigente):
jugador como cuadrado azul y enemigos como triángulos de colores y tamaños según
su clase (ver sección 0). Las armas usan los dibujos de `Assets/`
(`weapon_arrow.png`, `weapon_bow.png`, `weapon_bow_arrow.png`,
`weapon_longsword.png`, `weapon_staff.png`), pixel-art blanco para aplicar
tinte del color de la clase en armas enemigas.

Cuando una tarea requiera un elemento visual no cubierto por este estilo:

1. Revisar el código de dibujado existente y sus convenciones.
2. Utilizar la herramienta de preguntas antes de implementar la parte visual para
   confirmar si el usuario desea extender el estilo geométrico o aportar un
   recurso externo (solicitar nombre exacto y ruta).
3. Si el recurso indicado no puede localizarse, pedir su ruta o el archivo
   correspondiente.

Además:

- No asumir qué figura o recurso utilizar ni inventar nombres o rutas.
- Si se aporta un recurso externo, comprobar su disponibilidad y compatibilidad
  con el uso previsto.
- Consultar detalles como spritesheet, fotogramas o animaciones cuando sean
  necesarios y no estén documentados.
- Si falta el archivo, solicitarlo antes de avanzar con la parte que depende
  de él.
- Continuar con la lógica independiente de los recursos gráficos mientras se
  resuelve la consulta.

## 8. Flujo Git (registrado; aplicación pendiente)

El proyecto aún no tiene repositorio ni remoto, y Git no está funcional en la
terminal. No inicializar ni configurar Git sin solicitud explícita del usuario.
Cuando Git esté disponible, aplicar este flujo.

Antes de implementar:

- Comprobar si el proyecto utiliza Git.
- Revisar estado del repositorio, rama actual, remotos y estrategia de ramas
  documentada.
- Respetar el flujo existente. Sin estrategia definida, consultar rama base,
  convención de nombres y remoto. No asumir que `develop` existe ni imponer
  GitFlow completo sin acordarlo.

Crear una rama de trabajo antes de modificar código, con nombre descriptivo
conforme a las convenciones del repositorio. Ejemplos:

- `feature/<descripcion>`
- `fix/<descripcion>`
- `docs/<descripcion>`
- `refactor/<descripcion>`

Si ya existe una rama apropiada, verificar si corresponde continuar en ella.

No implementar directamente sobre `main`, `master` o `develop`.

Si existen cambios previos del usuario: preservarlos, identificar si interfieren
con la tarea y consultar antes de cualquier operación que pueda moverlos,
descartarlos o mezclarlos.

## 9. Implementar y verificar

- Definir criterios de aceptación a partir del requisito, la documentación y las
  aclaraciones del usuario.
- Realizar cambios enfocados en el alcance acordado.
- Ejecutar las comprobaciones disponibles y pertinentes al cambio (scripts del
  proyecto en `package.json` cuando exista el andamiaje; mientras tanto,
  verificación de sintaxis/ejecución con Node según corresponda).
- Verificar las interacciones identificadas durante el análisis de impacto.
- Agregar pruebas cuando aporten valor para validar reglas o prevenir
  regresiones. No hay framework de pruebas definido; no imponer uno sin
  acordarlo con el usuario.
- Evitar pruebas que solo repliquen la implementación.
- Informar qué se verificó y qué quedó pendiente.
- No afirmar resultados que no fueron comprobados.

## 10. Solicitar confirmación y realizar commit y push

Cuando termine la implementación:

1. Presentar al usuario: resumen del comportamiento implementado, archivos
   afectados, verificaciones realizadas y sus resultados, pendientes o
   limitaciones reales, y rama de trabajo utilizada.
2. Utilizar la herramienta de preguntas para solicitar: confirmación de que la
   implementación es aceptada y autorización explícita para commit y push.
3. Esperar la respuesta.
4. Si el usuario solicita ajustes: realizarlos, repetir las verificaciones
   afectadas y volver a solicitar confirmación.

Después de recibir autorización:

1. Revisar `git status`, `git diff` y `git log --oneline -10`.
2. Revisar los archivos nuevos que se incluirán.
3. Preparar únicamente los cambios de la tarea, sin cambios ajenos ni secretos.
4. Crear un commit descriptivo, coherente con las convenciones del repositorio.
5. Hacer push de la rama al remoto acordado, configurando su seguimiento cuando
   corresponda.
6. Informar rama, identificador y mensaje del commit, y resultado del push.

No realizar commit ni push sin autorización explícita. No hacer force push, omitir
hooks, modificar la configuración de Git ni fusionar ramas sin solicitud expresa.
Si un hook o comprobación falla, resolverlo antes de continuar. Si commit o push
falla, informar el resultado sin afirmar que la operación se completó. Un pull
request y la integración en la rama base requieren autorización adicional.

## 11. Comunicar el análisis y los resultados

Antes de implementar, presentar un análisis breve con los puntos pertinentes:

### Análisis previo

- **Requisito:** comportamiento solicitado.
- **Documentación:** estado y referencias (documento y sección; página si es PDF).
- **Conflictos e impacto:** funcionalidades y reglas afectadas.
- **Reutilización:** código existente aprovechable.
- **Diseño:** enfoque POO y patrones pertinentes.
- **Recursos gráficos:** estilo geométrico vigente o consulta pendiente.
- **Git:** rama base y rama de trabajo.
- **Dudas:** decisiones que requieren respuesta del usuario.

Para consultas simples, reducir el formato a los puntos aplicables.

Al finalizar, resumir: cambios y archivos afectados, decisiones relevantes,
verificaciones ejecutadas, pendientes reales, confirmación solicitada, y
resultado de commit y push únicamente si fueron autorizados y ejecutados.

No presentar propuestas como funcionalidades implementadas.

## Flujo esperado para futuras implementaciones

revisar documentación → analizar impacto → aclarar dudas →
confirmar recursos gráficos cuando corresponda → definir y crear rama →
diseñar y reutilizar → implementar → verificar →
solicitar confirmación → commit → push.
