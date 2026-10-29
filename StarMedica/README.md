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