# Backlog de continuación — ERP Star Médica

**Actualizado:** 09/11/2026  
**Criterio de trabajo:** avanzar en tareas locales que no dependan de servicios, permisos o decisiones clínicas/legales pendientes; conservar el orden del proyecto cuando las dependencias lo permitan. El despliegue queda para la fase final. No sustituir bloqueos por demos ni datos ficticios.

## Evidencia reciente

| Tarea | Estado | Evidencia |
|---|---|---|
| Recuperar farmacia ante fallos de carga | ✅ Hecha | Los errores ya no se presentan como inventario vacío ni dejan acciones habilitadas con datos obsoletos. Se agregó reintento; prueba de integración verifica fallo inicial, fallo de recarga y recuperación vacía. Suite Angular: 105/105; build Development aprobado. |
| Alinear validación de farmacia con la API | ✅ Hecha | Cantidades de recepción/dispensación respetan >0, máximo 1,000,000 y precisión de 0.001; reposición respeta 0–1,000,000; vencimiento requiere una fecha posterior a hoy en Guatemala. La prueba verifica valores fuera de rango y fecha no elegible. Suite Angular: 106/106; build Development y `git diff --check` aprobados. |
| Proteger el flujo de despacho ante duplicados y rechazo | ✅ Hecha | Prueba de integración confirma que despachos concurrentes no duplican la solicitud, que un rechazo conserva paciente/cantidad y permite reintentar, y que un éxito cierra el formulario y recarga el panel. Suite Angular: 107/107; build Development y `git diff --check` aprobados. |
| Proteger el flujo de recepción de lotes | ✅ Hecha | Prueba de integración confirma que recepciones concurrentes no duplican la solicitud, que un lote duplicado conserva los datos y permite corregir/reintentar, que las referencias se normalizan al enviar y que un éxito cierra el formulario y recarga el panel. Suite Angular: 108/108; build Development y `git diff --check` aprobados. |
| Proteger el alta de medicamentos | ✅ Hecha | Prueba de integración confirma que altas concurrentes no duplican solicitudes, un rechazo conserva los datos para reintentar, código/textos se normalizan antes del envío y el éxito cierra/restablece formulario y recarga el panel. Suite Angular: 109/109; build Development y `git diff --check` aprobados. |

## Pendientes y bloqueos

| ID | Sprint | Tarea pendiente | Estado / dependencia indispensable | Próximo paso seguro |
|---|---:|---|---|---|
| S0-CI | 0 | Ejecutar CI remoto, incluida construcción y smoke test de Docker | Pendiente: requiere runner GitHub Actions y push/PR autorizado. Docker no está disponible localmente. | Ejecutar el workflow en GitHub con autorización; no publicar la imagen. |
| S0-AUTH | 0 | Validar login Google, refresh, petición autenticada y logout en el ambiente de aceptación | Bloqueado hasta contar con API desplegada, orígenes OAuth autorizados y configuración protegida. El despliegue se reserva para el final. | Mantener solo pruebas locales que no necesiten identidad/proveedor real; hacer E2E al habilitar el ambiente. |
| S0-ACEPT | 0 | Obtener aceptación formal de Staging/Production y cierre de Sprint 0 | Bloqueado por validación desplegada y aprobación del responsable del producto. | Completar el acta con ambiente, versión, fecha y decisión cuando exista evidencia. |
| S2-GEO | 2 | Integrar coordenadas/geografía de pacientes | Bloqueado por fuente de coordenadas autorizada y evaluación de privacidad/consentimiento. | No geocodificar ni enviar datos personales a servicios públicos; solicitar decisión y fuente aprobada. |
| S3-WA | 3 | Integrar recordatorios por WhatsApp | Bloqueado por proveedor/configuración, plantillas y consentimiento aprobados. | Mantener agenda local; no enviar mensajes reales ni simular entregas. |
| S4-ACEPT | 4 | Cerrar aceptación funcional del expediente clínico | Pendiente de revisión del responsable clínico; no se deben inferir políticas ni modificar decisiones clínicas. | Continuar con pruebas técnicas sin alterar reglas clínicas y registrar los criterios aprobados. |
| S6-REM | 6 | Integrar recordatorios de farmacia/inventario | Bloqueado por decisiones de proveedor, contenido y autorización de notificaciones. | Mantener el inventario local y posponer envíos externos. |
| S7-FEL | 7 | Emisión fiscal FEL SAT Guatemala | Bloqueado por documentación y certificador FEL, además de aprobación fiscal/legal. | Mantener los borradores internos; no presentar el módulo como emisor fiscal. |
| S8-PORTAL | 8 | Habilitar portal de paciente/tutor | Bloqueado por matriz aprobada de autoridad, consentimiento y acceso pediátrico. | No habilitar acceso a expedientes ni inferir la autoridad del tutor. |
| S9-IA | 9 | Definir MCP y asistente IA | Bloqueado hasta aprobar alcance, tratamiento de datos clínicos, controles y límites de uso. | No conectar datos de pacientes ni automatizar recomendaciones clínicas. |
| S10-REP | 10 | Completar reportes y pulido final | Pendiente de definiciones de métricas, usuarios autorizados y criterios de aceptación. | No inventar indicadores; solicitar definiciones al responsable antes de construir reportes. |

## Flujo para cada continuación

1. Identificar sprint, requisitos ya existentes, dependencias y aprobaciones requeridas.
2. Elegir una tarea local que no cruce un bloqueo clínico, legal, de privacidad o de servicios externos.
3. Implementar de forma acotada y agregar pruebas sobre el comportamiento esperado.
4. Ejecutar la prueba focalizada, compilación del área y `git diff --check`.
5. Registrar resultado, límites y bloqueos aquí y en `PROMPT_00_MASTER.md`.
6. No desplegar ni enviar cambios remotos sin autorización específica.
