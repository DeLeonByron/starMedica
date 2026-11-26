# Perfil de dominio — Salud y pediatría

Adjuntar junto al prompt maestro solo si el producto trata datos, atención o procesos de salud. Para atención de menores o una solución comercial multi-clínica, adjuntar también `PEDIATRIC_SAAS.md`. Este perfil complementa, no reemplaza, asesoría clínica, legal, de privacidad o de seguridad.

## Límites clínicos y de seguridad

- No diagnostiques, prescribas ni inventes guías, dosis, calendarios de vacunación, umbrales, códigos clínicos o criterios de emergencia. Consulta guías oficiales vigentes y exige revisión por profesional competente antes de usar contenido clínico.
- Distingue claramente ayuda administrativa, soporte a decisión y decisión clínica. Para funciones que puedan afectar diagnóstico/tratamiento, eleva el riesgo y exige análisis especializado antes de diseñar o desplegar.
- No sustituyas el juicio clínico ni instrucciones de emergencia por mensajes generados. Define rutas de escalamiento aprobadas por el responsable clínico.
- En pediatría considera que tutor, paciente y representante legal pueden ser personas distintas; no asumas autoridad, consentimiento, visibilidad o acceso por parentesco. Requiere reglas validadas por jurisdicción y caso de uso.

## Datos de salud

- Trata datos clínicos, identificadores y datos de menores como altamente sensibles: minimiza, separa ámbitos, restringe acceso, registra auditoría sin replicar el contenido sensible y evita usarlos en prompts externos, analítica o telemetría no aprobadas.
- Diseña permisos por rol y contexto de atención, acceso de emergencia si se requiere, trazabilidad, corrección, exportación, retención y eliminación conforme a políticas aprobadas.
- No uses datos reales en demos, semillas, capturas o pruebas. Emplea datos sintéticos que no correspondan a personas reales.
- Revisa proveedores de nube/IA, subencargados, región, retención, entrenamiento, transferencias y acuerdos antes de enviar datos sanitarios.
- Define quién decide finalidades y medios del tratamiento en cada flujo (clínica, proveedor SaaS u otra parte) con asesoría local; no infieras responsabilidades solo por el contrato o por alojar los datos.
- Distingue expedientes clínicos, datos operativos, telemetría y facturación. Define finalidad, mínimo necesario, acceso, retención y eliminación para cada conjunto.

## Verificación para Guatemala

Si `profiles/GUATEMALA.md` está activo, consulta la fuente oficial concreta del MSPAS, IGSS u otra autoridad que corresponda. Confirma versión, fecha y alcance de cada protocolo o catálogo clínico; nunca fijes como permanentes catálogos sanitarios que cambian.

## Aceptación mínima

Antes de publicar una función clínica: responsable clínico identificado, fuente/versión de contenido trazable, revisión de privacidad y seguridad, pruebas de permisos/auditoría, escenarios de fallo y procedimiento de reversión documentados.
