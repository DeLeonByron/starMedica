# Prompts para agentes de desarrollo empresarial

Paquete de prompts reutilizable para iniciar proyectos de software empresariales. La base es independiente del sector; los perfiles de salud y Guatemala se activan únicamente cuando correspondan al proyecto.

Los agentes instalables de GitHub Copilot se encuentran en `../.github/agents/`. Este directorio contiene la documentación fuente y perfiles de contexto; Copilot no convierte automáticamente cada prompt de aquí en un agente.

## Archivos

- `PROJECT_CONTEXT.template.md`: datos que el equipo completa para personalizar el proyecto.
- `PROMPT_00_MASTER.md`: reglas compartidas por todos los agentes.
- `PROMPT_01_DISCOVERY_ARCHITECT.md`: descubrimiento, análisis del repositorio y decisiones de arquitectura.
- `PROMPT_02_BACKEND.md`: agente de backend.
- `PROMPT_03_FRONTEND.md`: agente de frontend.
- `PROMPT_04_PLATFORM_RELEASE.md`: infraestructura, CI/CD y operación.
- `profiles/HEALTHCARE.md`: requisitos adicionales para productos de salud.
- `profiles/PEDIATRIC_SAAS.md`: producto pediátrico multi-clínica vendido como SaaS.
- `profiles/GUATEMALA.md`: fuentes y verificaciones aplicables a proyectos en Guatemala.
- `PROMPT_05_PEDIATRIC_SAAS_PRODUCT.md`: agente de producto y análisis para la aplicación pediátrica SaaS.
- `PROMPT_06_LEGAL_COMPLIANCE_RESEARCH.md`: agente de investigación legal/regulatoria y matriz de obligaciones.
- `PROMPT_07_SAAS_ARCHITECTURE.md`: agente de arquitectura SaaS, tenancy, seguridad y operación.
- `../.github/agents/`: agentes personalizados de GitHub Copilot en formato `.agent.md`, con responsabilidades y descripciones individuales.

## Cómo iniciar una sesión

1. Copiar este paquete a la carpeta de prompts del proyecto.
2. Completar `PROJECT_CONTEXT.template.md` como `PROJECT_CONTEXT.md`; marcar explícitamente los perfiles activos. No introducir secretos ni datos reales de pacientes.
3. Dar al agente el `PROMPT_00_MASTER.md`, el contexto y solo el prompt de rol que necesita.
4. Para una clínica pediátrica SaaS en Guatemala, adjuntar `profiles/HEALTHCARE.md`, `profiles/PEDIATRIC_SAAS.md` y `profiles/GUATEMALA.md`. Para otros productos, activar solo los perfiles pertinentes.
5. Pedir al agente que inspeccione el repositorio, sus manifiestos, pruebas y convenciones antes de proponer o editar cambios.

El contexto del proyecto y las decisiones aprobadas prevalecen sobre ejemplos de estos prompts. Si falta una decisión que pueda cambiar seguridad, obligaciones, arquitectura, costo o comportamiento, el agente debe preguntar antes de implementarla.

## Agentes sugeridos para el producto pediátrico SaaS

1. **Producto y descubrimiento:** usar `PROMPT_05_PEDIATRIC_SAAS_PRODUCT.md` para mapear usuarios, flujos y límites clínicos/comerciales.
2. **Investigación legal en paralelo temprano:** usar `PROMPT_06_LEGAL_COMPLIANCE_RESEARCH.md` para identificar preguntas, fuentes primarias, responsabilidades y bloqueos antes de cerrar requisitos o contratos.
3. **Arquitectura SaaS:** usar `PROMPT_07_SAAS_ARCHITECTURE.md` con los hallazgos etiquetados como confirmados o pendientes; no convertir interpretaciones legales en reglas técnicas sin aprobación.
4. **Implementación:** asignar `PROMPT_02_BACKEND.md`, `PROMPT_03_FRONTEND.md` o `PROMPT_04_PLATFORM_RELEASE.md` a cambios acotados con criterios de aceptación aprobados.
5. **Antes del piloto con pacientes y antes de producción:** obtener revisión profesional legal, tributaria, clínica y de seguridad para los temas que apliquen; validar aislamiento entre clínicas, restauración y flujos de consentimiento/acceso.

## Agentes de GitHub Copilot incluidos

Copilot descubre los archivos `.agent.md` en `.github/agents/` del repositorio/workspace. Agentes creados:

- `pediatric-saas-orchestrator`: coordina fases y revisa la arquitectura integral, contratos y dependencias frontend/backend.
- `pediatric-saas-product`: producto, actores, historias y criterios de aceptación.
- `pediatric-saas-discovery`: inspección del repositorio y descubrimiento técnico inicial.
- `pediatric-saas-legal-research`: matriz legal/regulatoria para revisión profesional, no certificación.
- `pediatric-saas-architecture`: tenancy, límites de datos, amenazas y operación.
- `pediatric-saas-backend`: APIs, persistencia, permisos por tenant y pruebas.
- `pediatric-saas-frontend`: UX, contratos, personalización, accesibilidad y privacidad cliente.
- `pediatric-saas-platform`: CI/CD, infraestructura, secretos y recuperación.
- `pediatric-saas-bug-security-review`: revisión de bugs y seguridad frontend/backend; por defecto solo informa y no edita.

Los agentes están diseñados para uso como Copilot custom agents en el workspace. Si el proyecto tiene otro repositorio raíz, copia `.github/agents/` a su raíz para que Copilot lo descubra allí. Usa `pediatric-saas-orchestrator` para coordinación integral; los agentes especializados también pueden invocarse directamente.

No se recomienda convertir al agente legal en autoridad para aprobar releases: los elementos jurídicos/clínicos de riesgo alto deben quedar como bloqueantes hasta revisión de las personas profesionales responsables.

## Fuentes externas

Los enlaces de perfiles son puntos de partida, no evidencia suficiente por sí solos. El agente debe consultar la fuente primaria concreta que aplique, registrar URL, título, fecha de consulta y vigencia/fecha de publicación cuando estén disponibles, y decir claramente si el sitio no responde. No debe reemplazar una fuente oficial bloqueada por una afirmación sin verificar.

## Relación con los prompts originales

Los archivos `../PROMPT_00_MASTER.md` a `../PROMPT_03_DEPLOY.md` de la carpeta original se dejan intactos. Son material específico de Star Médica; fijan una clínica pediátrica, un stack y proveedores concretos. No deben cargarse como reglas universales ni usarse como autoridad de soporte vigente. Para iniciar la nueva aplicación, trata esos documentos solo como referencia funcional y vuelve a verificar requisitos, tecnología y obligaciones.
