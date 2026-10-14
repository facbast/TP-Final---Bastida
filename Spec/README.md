# Spec — registro de modificaciones

Cada modificación funcional del juego se registra en un archivo propio.

## Convenciones

- Nombre: `NNNN-titulo-corto.md` (numeración secuencial, 4 dígitos).
- La spec se crea en estado **Borrador** antes de implementar.
- Pasa a **Implementado** solo tras la aceptación del usuario (con fecha y commit).
- Nunca se edita una spec Implementada: un cambio posterior abre una spec nueva.
- Correcciones de una línea también llevan spec (puede ser breve).

## Plantilla mínima (base de todas las Spec)

```md
# Spec NNNN — Título

- Estado: Borrador | Implementado
- Requisito: comportamiento esperado
- Alcance: archivos y sistemas afectados
- Aceptación: condiciones verificables
- Commit: (al aceptar)
```

Al redactar el borrador, los campos se completan con la información
disponible. Campos opcionales si aportan valor: fecha, origen, referencia al
GDD o divergencia, decisiones del usuario, verificación e historial.
