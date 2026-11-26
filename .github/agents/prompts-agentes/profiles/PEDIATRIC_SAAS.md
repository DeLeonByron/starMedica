# Perfil de producto — Pediatría SaaS multi-clínica

Activa este perfil cuando el producto web atiende flujos pediátricos y se ofrece a varias clínicas como servicio. Adjunta además `HEALTHCARE.md` y, para operaciones guatemaltecas, `GUATEMALA.md`.

## Alcance y postura

- Diseña un sistema empresarial configurable para clínicas pediátricas independientes; el paquete no define el nombre, logo, colores, dominio, especialidad secundaria ni datos legales de ninguna clínica.
- Mantén separados el núcleo SaaS del proveedor, la configuración de cada clínica y los datos clínicos que la clínica administra. No presentes capacidades de demostración como consejo clínico.
- No asumas que la solución será expediente clínico legalmente suficiente, dispositivo médico, telemedicina autorizada o sistema certificado. Analiza cada capacidad y jurisdicción antes de afirmarlo.
- Distingue las responsabilidades del proveedor de software y de cada clínica. El contrato no sustituye los controles técnicos ni decide por sí solo quién determina finalidades y medios de los datos.

## Personalización y marca por clínica

Modela la identidad de la clínica como configuración segregada por tenant, sin duplicar código por cliente:

- nombre visible y razón social/datos fiscales, como campos con finalidades diferentes;
- logo, color/tema y contacto; dominios y remitentes verificados si se habilitan;
- locale, zona horaria, moneda y formatos, de forma explícita;
- plantillas de documentos/notificaciones y textos legales versionados, con aprobación y vigencia;
- módulos disponibles, permisos y parámetros de operación aprobados.

La marca configurable no puede alterar requisitos legales obligatorios, consentimiento, privacidad, identificación del responsable, seguridad ni auditoría. Evita una etiqueta blanca que oculte al proveedor o a la clínica cuando su identificación sea necesaria. No dejes que personalizar una pantalla permita modificar reglas de autorización. Protege cargas de logos frente a contenido ejecutable, archivos abusivos y filtración entre tenants.

## Dominio pediátrico

- Representa al menor como paciente y a cada adulto como una persona con relación y autoridad acreditada, no como propietario automático del expediente.
- Soporta más de un padre/madre/tutor/contacto, relaciones con vigencia, documentación/estado de verificación y revocación de autorizaciones según política aprobada.
- Distingue contacto de emergencia, pagador, acompañante, tutor/representante y profesional tratante; son roles diferentes.
- No codifiques una edad universal de consentimiento, reglas de custodia, acceso del adolescente o confidencialidad. Obtén reglas por jurisdicción de fuente primaria y aprobación legal/clínica.
- Minimiza datos de menores, restringe búsqueda/listados/exportaciones, registra quién accedió o cambió información y evita revelar la existencia de un paciente a un tenant/usuario no autorizado.
- Usa perfiles por paciente/contexto para aplicar restricciones aprobadas. Una excepción de emergencia, si se requiere, debe ser explícita, temporal, justificada, auditada y aprobada; no es una puerta trasera.
- La atención clínica sigue bajo responsabilidad profesional. No generes dosis, diagnóstico, alerta clínica o calendario de vacunas sin fuente/versionado, validación por profesionales y pruebas de seguridad.

## SaaS, tenants y ciclo comercial

- Define si la clínica, el profesional, el cuidador u otra parte contrata; quién es usuario; cómo se cuentan licencias y qué sucede en cambios de plan, deuda, suspensión, cancelación y baja.
- Diseña onboarding verificable: alta de organización, verificación de administrador, configuración segura, carga de logo, roles, aceptación/versionado de documentos y checklist de salida a producción.
- Mantén el sistema de administración del proveedor separado del portal de clínica y de datos clínicos. Usa permisos de soporte de mínimo privilegio, aprobación, tiempo limitado, motivo y auditoría; restringe por defecto la impersonación.
- Aísla lecturas y escrituras en servidor, jobs, búsquedas, exports, archivos, cachés, colas, observabilidad y backups. Evita confiar en un `tenantId` del cliente o en filtros únicamente de UI.
- Diseña exportación y baja por tenant sin destruir la retención legal/operativa que se haya confirmado; provee borrado controlado y reporte de resultado según política aprobada.
- Cualquier integración, subprocesador o función de IA debe tener propósito, límites, ubicación/retención verificados, permisos de datos y alternativa ante indisponibilidad.

## Decisiones bloqueantes antes de producción

No des por “listo” para producción hasta que responsables designados hayan aprobado:

1. mapa de datos y flujos, tenants, amenazas y permisos;
2. matriz legal/regulatoria de Guatemala (si aplica) revisada por abogado/a local;
3. autoridad, consentimiento, acceso y confidencialidad pediátricos revisados por asesoría legal y responsable clínico;
4. contrato de suscripción, privacidad/procesamiento, subencargados, SLA y salida revisados profesionalmente;
5. ubicación, backups, retención, recuperación, respuesta a incidentes y pruebas de aislamiento;
6. contenido clínico con fuente y versión cuando exista;
7. identidad, marca, dominios, textos legales y reglas por clínica revisados y versionados.

Usa únicamente datos sintéticos en desarrollo, demos y pruebas.
