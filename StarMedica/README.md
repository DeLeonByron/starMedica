# Star Médica API

## Desarrollo local

Requisitos: .NET SDK 9, SQL Server LocalDB y Node.js 22.

La instancia local `MSSQLLocalDB` usa `appsettings.Development.json`. La base `StarMedicaDB` ya está inicializada con las migraciones incluidas; para actualizarla después de agregar una migración:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet tool restore
dotnet tool run dotnet-ef migrations add 20261028_DescripcionCambio --project src/StarMedica.Infrastructure --startup-project src/StarMedica.API
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet tool run dotnet-ef database update --project src/StarMedica.Infrastructure --startup-project src/StarMedica.API
```

Configura secretos locales con .NET User Secrets. No guardes estas claves en archivos versionados:

```powershell
dotnet user-secrets set 'Jwt:Key' '<clave aleatoria de al menos 32 bytes>' --project src/StarMedica.API
dotnet user-secrets set 'Google:ClientId' '<client-id de Google Identity Services>' --project src/StarMedica.API
dotnet user-secrets set 'BootstrapAdminEmail' '<correo verificado del primer administrador>' --project src/StarMedica.API
```

`BootstrapAdminEmail` es opcional; si se configura, solo esa identidad de Google verificada recibe el rol inicial `SuperAdmin`. Los demás usuarios quedan sin roles y no pueden consultar pacientes.

Arranca la API con `dotnet run --project src/StarMedica.API --launch-profile http`. La URL local es `http://localhost:5067` y el health check es `/health`.

## Frontend

Desde la raíz del workspace:

```powershell
npm --prefix star-medica ci
npm --prefix star-medica run start
npm --prefix star-medica run build:dev
npm --prefix star-medica run build:staging
npm --prefix star-medica run build:prod
npm --prefix star-medica run test -- --watch=false --browsers=ChromeHeadless
```

El Client ID público de Google se configura en `star-medica/src/environments/environment.ts`. Staging y producción requieren sus propios Client IDs y endpoints antes de desplegar.

## Configuración de despliegue

En Staging/Production, configura mediante el proveedor de secretos:

- `ConnectionStrings__StarMedicaDB`
- `Jwt__Key` (mínimo 32 bytes aleatorios)
- `Jwt__Issuer`
- `Jwt__Audience`
- `AllowedOrigins__0` y los orígenes frontend adicionales necesarios
- `Google__ClientId`
- `BootstrapAdminEmail` solo durante el bootstrap inicial

La aplicación falla al iniciar si falta conexión, clave JWT, issuer, audience u origen permitido. No hay despliegue remoto configurado en este workspace.

## Expediente clínico

Las consultas clínicas son registros inmutables: se crean con `POST /api/consultations` y se leen por `GET /api/consultations/{id}` o `GET /api/consultations/patients/{patientId}`. Solo perfiles `Médico` y `SuperAdmin` pueden acceder. El médico se obtiene del JWT, no del body. El command valida el formato CIE-10, los rangos de signos vitales y la presión arterial; al vincular una cita, la completa en la misma transacción y no permite reutilizarla.

Validación local del backend:

```powershell
dotnet test StarMedica.sln
```

## Catálogo de departamentos

El catálogo de Guatemala contiene los 22 departamentos y se prepara antes de vincularlo con pacientes y municipios. En una base local existente, ejecuta el script idempotente y aplica después la migración EF:

```powershell
sqlcmd -S '(localdb)\MSSQLLocalDB' -E -d StarMedicaDB -b -i database\02_Catalogs.sql
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet tool run dotnet-ef database update --project src\StarMedica.Infrastructure --startup-project src\StarMedica.API
```

La migración tolera que el script ya haya creado la tabla. El script conserva IDs estables para los 22 departamentos y puede volver a ejecutarse para reparar los nombres oficiales si la carga previa tuvo problemas de codificación.

## Facturación interna (borradores)

La primera entrega de facturación permite crear, consultar y editar borradores internos mediante `/api/billing/drafts`. La creación responde `201 Created` con un encabezado `Location` al recurso recién creado. La consulta admite `search`, `pageNumber` (desde 1) y `pageSize` (1–100), busca por cliente, NIT, concepto o número exacto, y devuelve el total de coincidencias y páginas. No emite ni certifica documentos FEL, no calcula impuestos y no procesa pagos. El módulo está limitado a `SuperAdmin` y `Recepcionista`; los totales se calculan en el servidor a partir de conceptos manuales. Las ediciones son transaccionales y actualizan los datos de auditoría sin cambiar quién creó el borrador.

El esquema local se define en `database/20261101_CreateBillingDrafts.sql`. Ejecútalo antes de registrar la migración EF en una base existente:

```powershell
sqlcmd -S '(localdb)\MSSQLLocalDB' -E -d StarMedicaDB -b -i database\20261101_CreateBillingDrafts.sql
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet tool run dotnet-ef database update --project src\StarMedica.Infrastructure --startup-project src\StarMedica.API
```

La migración `20261101_CreateBillingDrafts` verifica las tablas antes de crearlas para que el flujo SQL → EF sea repetible. No se debe presentar un borrador como factura fiscal.

### Preparación de integración FEL

La integración permanece deshabilitada hasta elegir un certificador y recibir su documentación oficial. No se presuponen endpoints, autenticación, estructura XML/JSON, catálogos, estados de certificación, anulaciones ni políticas de reintento. Los borradores internos existentes no son payload FEL ni deben marcarse como certificados.

Cuando exista documentación, la integración deberá aislar el contrato específico del proveedor detrás de un adaptador en Infrastructure y mantener Application/Domain independientes del SDK o formato del certificador. Definir los estados y transiciones únicamente con el contrato documentado; registrar correlación y auditoría sin almacenar credenciales ni exponer datos sensibles en logs. Reintentar envíos solo si la documentación define idempotencia y semántica de reintento.

Insumos necesarios para diseñarla: nombre y contrato oficial del certificador; especificación y versión de API/esquema; URLs de sandbox y producción; mecanismo de autenticación (sin compartir secretos en el repositorio o chat); reglas de envío, respuesta y consulta de estado; comportamiento ante duplicados, indisponibilidad, anulación y errores; material de pruebas y criterios de aceptación fiscal. Hasta entonces no crear endpoints ni tablas que afirmen representar una factura certificada.

## Portal Paciente/Tutor — prerequisitos de integración real

El portal no está implementado ni habilitado. No conectar una cuenta de paciente/tutor directamente a los endpoints administrativos actuales de pacientes, citas, vacunación o expediente: estos no establecen ni verifican por sí mismos una relación paciente-representante.

Antes de habilitar el módulo se requiere la matriz clínica/legal aprobada de autoridad, representación, consentimiento, confidencialidad del menor, acceso y revocación, así como el flujo de verificación de identidad y el contrato de API. La implementación real deberá autorizar cada recurso en el backend, comprobar la relación y el permiso en cada solicitud y cubrir con pruebas el acceso cruzado entre pacientes, revocación, expiración y los roles existentes. Los guards Angular son únicamente UX, no controles de seguridad. Tras aprobar estas reglas, el frontend podrá consumir contratos tipados del portal para agenda, vacunación y únicamente las partes del expediente autorizadas. No se incluyen pantallas con datos ficticios como funcionalidad del producto.