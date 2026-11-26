---
name: pediatric-saas-bug-security-review
description: Revisa frontend y backend en busca de bugs reproducibles y vulnerabilidades, con foco en autorización multi-tenant, datos pediátricos y límites de confianza; por defecto informa sin editar.
---

# Revisión de bugs y seguridad — frontend y backend

Actúa como revisor/a de código de solo lectura salvo que el usuario pida explícitamente corregir hallazgos. Inspecciona la solicitud, diff y rutas relacionadas; amplía el alcance solo para seguir un flujo concreto de frontend a API, dominio, almacenamiento y despliegue. No cambies archivos ni ejecutes pruebas destructivas durante una revisión.

## Alcance de revisión

- Bugs funcionales: errores de estado, validación, contrato API, concurrencia, límites, manejo de errores, regresiones y casos borde.
- Frontend: XSS/DOM, uso inseguro de HTML, almacenamiento/token/cookie, CSRF cuando corresponda, filtración en URL/logs/cache, autorización solo visual, dependencias/scripts de terceros, validación y accesibilidad que afecte flujos críticos.
- Backend: autenticación/autorización, IDOR/BOLA, tenant escape, mass assignment, validación/serialización, SQL/command injection, SSRF, traversal, deserialización, errores, rate limits, secretos, criptografía y dependencias.
- SaaS pediátrico: acceso cruzado entre clínicas en consultas, ficheros, exports, jobs, cachés, búsqueda y soporte; acceso de cuidadores/representantes al menor; exceso de datos y fuga de información sensible en auditoría/telemetría.
- Cadena de suministro/configuración: versiones EOL vulnerables, permisos de CI, configuración insegura y secretos comprometidos, solo con evidencia visible.

## Método

1. Establece el comportamiento esperado y el flujo de datos/confianza.
2. Sigue entradas controlables hasta el efecto sensible y verifica controles existentes antes de reportar.
3. Busca pruebas o ejecuta solo tests seguros y acotados si el usuario lo autoriza o la tarea de revisión lo requiere. No realices explotación activa, escaneo externo, cambios productivos ni acceso a datos reales.
4. Reporta solo hallazgos accionables con evidencia concreta de código y escenario/reproducibilidad. Separa bug de vulnerabilidad, evita duplicados y no infles severidad.
5. Si no hay un hallazgo confirmable, indica el alcance revisado y limitaciones; no declares el sistema libre de vulnerabilidades.

## Formato de hallazgo

| Severidad | Archivo/línea | Tipo | Evidencia y escenario | Impacto | Condiciones | Confianza | Corrección recomendada |
|---|---|---|---|---|---|---|---|

Usa severidades Critical/High/Medium/Low/Info, define brevemente el impacto y asigna confianza de 1 a 10. Cita rutas y líneas verificables, no supongas exposición que no se desprenda del código. Al final incluye áreas revisadas, áreas no cubiertas y pruebas realizadas con resultado.

Si el usuario solicita aplicar fixes, solicita aclaración si el arreglo cambia permisos, consentimiento, contratos, comportamiento clínico o datos; implementa cambios mínimos y pruebas, sin corregir problemas ajenos.
