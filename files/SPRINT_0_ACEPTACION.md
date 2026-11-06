# Sprint 0 — Acta técnica de aceptación y checklist

**Fecha de verificación:** 04/11/2026 (America/Guatemala)  
**Ambiente verificado:** Development local  
**Estado:** **PENDIENTE DE ACEPTACIÓN FORMAL**  
**Alcance de esta evidencia:** compilación, pruebas existentes y disponibilidad local de la API/BD. No acredita despliegue en staging o producción.

## Decisión de alcance

El responsable del proyecto confirmó que **Sprint 0 incluye autenticación funcional; Sprint 1 comienza después**. Por tanto, el cierre requiere demostrar el inicio de sesión Google, autorización de sesión y funcionamiento de refresh/logout en el ambiente de aceptación. Esta decisión resuelve la contradicción previa del MASTER.

## Evidencia técnica

| ID | Criterio | Resultado | Evidencia |
|---|---|---|---|
| S0-01 | Compilación Release de la solución .NET | ✅ Aprobado | `dotnet build C:\repositorios\agente_ia\StarMedica\StarMedica.sln --configuration Release --nologo`: 0 errores. |
| S0-02 | Pruebas automatizadas del backend | ✅ Aprobado | `dotnet test C:\repositorios\agente_ia\StarMedica\StarMedica.sln --no-build --configuration Release --nologo`: 45 aprobadas, 0 fallidas, 0 omitidas. |
| S0-03 | Compilación Angular Development | ✅ Aprobado | `npm run build:dev -- --no-progress`, ejecutado desde `C:\repositorios\agente_ia\star-medica`: compilación completada. |
| S0-04 | API local y conexión a base de datos | ✅ Aprobado, local | `GET http://localhost:5000/Health`: HTTP 200, `status=ok`, `database=connected`. La API se inició para la comprobación y se detuvo después. |
| S0-05 | Migraciones EF y catálogo de departamentos | ✅ Aprobado, LocalDB | EF reportó las 9 migraciones aplicadas, incluida `20261103041211_20261102_CreateDepartmentsCatalog`, y `has-pending-model-changes` indicó que no hay cambios pendientes. SQL de solo lectura confirmó 22 departamentos activos, 22 nombres distintos y 9 migraciones en historial. |
| S0-06 | Advertencias de dependencias | ✅ Resuelto localmente | AutoMapper y MailKit no tenían referencias de uso en el código; se retiraron las dependencias directas. MailKit introducía MimeKit y `System.Security.Cryptography.Pkcs` vulnerables. `dotnet list package --vulnerable --include-transitive` no reporta paquetes vulnerables en los proyectos; restore correcto, Release con 0 advertencias/0 errores y backend 45/45. |
| S0-07 | Compilaciones frontend Staging y Production | ✅ Aprobado, compilación | `npm run build:staging -- --no-progress` y `npm run build:prod -- --no-progress`: ambas compilaciones completadas. Esto no demuestra despliegue ni smoke test en esos ambientes. |
| S0-08 | Alcance de autenticación | ✅ Decisión confirmada | Sprint 0 incluye autenticación funcional; Sprint 1 comienza después. |
| S0-09 | Pruebas unitarias de handlers Auth | ✅ Aprobado, aplicación | Se agregaron nueve pruebas para correo no verificado, alta/bootstrap, usuario inactivo, vinculación y conflicto de cuenta Google, rechazo de refresh expirado/inactivo, rotación y revocación de refresh token. La suite completa pasa (45/45). |
| S0-10 | Client ID Google en frontend | ✅ Configurado y compilado | Los ambientes Development, Staging y Production tienen el mismo Client ID configurado; los builds de Staging y Production compilaron después del cambio. El identificador no se copia en esta acta. |
| S0-11 | Configuración de despliegue Railway | ✅ Archivos preparados; no desplegado | Se agregaron `railway.toml`, `StarMedica/Dockerfile` y `.dockerignore` para compilar/publicar el API .NET 9 desde el monorepo. `dotnet publish` Release confirmó la salida de publicación; Docker no está instalado en esta estación, así que no se pudo validar una imagen local. |
| S0-12 | APIs públicas de Staging/Production | ❌ API de Star Médica no identificada | Ambos dominios muestran la página predeterminada de Railway en `/`; `/swagger/v1/swagger.json` y `/api/auth/refresh` dan 404. `/Health` responde `text/plain: OK`, no el JSON emitido por el `HealthController` del repositorio. Los dominios no están conectados a este API desplegado; no se valida la BD ni Auth. |
| S0-13 | Autenticación Google end-to-end | ⚠️ Pendiente de smoke test | El código incluye GIS, validación del ID token en API, JWT, refresh token y logout. Aún falta confirmar los orígenes autorizados en Google Cloud, desplegar y configurar el API mediante variables protegidas y probar login, autorización, refresh y logout. Los builds exitosos no sustituyen esa prueba. |
| S0-14 | Rutas locales de Auth | ✅ Aprobado, smoke test sin identidad | Swagger local devuelve HTTP 200 e incluye rutas Auth. `POST /api/Auth/refresh` sin cookie devuelve 401; `POST /api/Auth/logout` sin cookie devuelve 204. No se usó una identidad Google real ni se probó la emisión de tokens. |
| S0-15 | Validación numérica del componente compartido | ✅ Aprobado, pruebas locales | `sm-input` conserva y valida mínimo, máximo y paso decimal; acepta `step="any"` y valores vacíos, emite números vía `ngModel` y rechaza valores no numéricos/no finitos incluso con `step="any"`. Prueba focalizada: 5 aprobadas, 0 fallidas; build Angular Development completado. |
| S0-16 | Restauración de sesión al reabrir la aplicación | ✅ Aprobado, pruebas locales | El guard intenta refresh usando la cookie HttpOnly aunque `sessionStorage` no tenga access token. Las pruebas verifican restauración exitosa y limpieza del estado ante HTTP 401: 2 aprobadas, 0 fallidas; build Angular Development completado. |
| S0-17 | Renovación concurrente de sesión | ✅ Aprobado, pruebas locales | Las llamadas simultáneas a `refreshSession()` comparten una petición HTTP, evitando competir por la rotación de la cookie. Pruebas focalizadas de Auth: 3 aprobadas, 0 fallidas; build Angular Development completado. |
| S0-18 | Interceptor Auth ante 401 concurrentes | ✅ Aprobado, pruebas locales | Dos solicitudes protegidas con 401 comparten un refresh y se reintentan con el token nuevo; un 401 tardío usa un token ya renovado sin una segunda rotación. Un 401 del propio endpoint Auth no dispara otro refresh. Un 403 al reintentar conserva la sesión; solo un refresh fallido la expira. Suite Angular completa: 61 aprobadas, 0 fallidas; build Development completado. |
| S0-19 | Restauración desde la ruta de login | ✅ Aprobado, pruebas locales | Al abrir `/auth/login`, el guard consulta la sesión HttpOnly: SuperAdmin/Médico/Recepcionista van a pacientes, Farmacéutico a farmacia y usuarios sin rol a aprobación pendiente. Un refresh 401 deja visible login sin navegación recursiva. Suite Angular completa: 65 aprobadas, 0 fallidas; build Development completado. |
| S0-20 | Manejo visible de fallo al cerrar sesión | ✅ Aprobado, pruebas locales | Si falla la revocación remota, se limpia la sesión local y se muestra aviso accesible indicando que no se pudo confirmar la revocación. Logout exitoso limpia la sesión sin aviso. Suite Angular completa: 67 aprobadas, 0 fallidas; build Development completado. |
| S0-21 | Navegación lateral según permisos | ✅ Aprobado, pruebas locales | Los enlaces visibles se derivan de las mismas constantes de roles que protegen las rutas; se validó navegación para Médico, Recepcionista, Farmacéutico, SuperAdmin y cuenta sin rol. Marca y breadcrumb usan el primer destino permitido. Suite Angular completa: 72 aprobadas, 0 fallidas; build Development completado. |
| S0-22 | Shell luego de perder sesión | ✅ Aprobado, pruebas locales | En error de logout, el shell oculta menú/breadcrumb al limpiar el usuario y mantiene visible el aviso de revocación no confirmada. Suite Angular completa: 73 aprobadas, 0 fallidas; build Development completado. |

## Checklist de aceptación formal

- [x] La solución backend compila en Release.
- [x] Las pruebas automatizadas existentes del backend pasan.
- [x] El frontend compila en Development.
- [x] El frontend compila para Staging y Production.
- [x] La API local responde y confirma conexión a la base de datos.
- [x] La base local tiene las 9 migraciones aplicadas, el modelo EF no tiene cambios pendientes y el catálogo tiene 22 departamentos activos distintos.
- [x] Las rutas locales Swagger/refresh/logout responden con los estados esperados sin sesión.
- [x] La aplicación intenta restaurar la sesión mediante la cookie HttpOnly al iniciar sin access token local, y limpia la sesión si el refresh falla.
- [x] Al entrar a la ruta de login, restaurar la sesión válida y dirigir al usuario al destino correspondiente; sin sesión válida, permanecer en login.
- [x] El destino post-login respeta las áreas existentes para los roles clínicos, recepción y farmacia.
- [x] La navegación lateral solo muestra rutas permitidas por los roles existentes; enlace de marca y breadcrumb no dirigen a un módulo bloqueado.
- [x] Al limpiarse la sesión, ocultar de inmediato el menú y breadcrumb protegidos y conservar visible el aviso de error de logout si corresponde.
- [x] Las renovaciones simultáneas de access token se consolidan en una única llamada al API.
- [x] El interceptor reintenta las solicitudes protegidas después del refresh y evita reintentar endpoints Auth.
- [x] Un 401 tardío reintenta con el token vigente si otra llamada ya lo renovó, sin volver a rotar el refresh token.
- [x] Un error de autorización posterior al refresh no borra una sesión renovada; la sesión se expira si falla el propio refresh.
- [x] El cierre de sesión muestra un aviso cuando el servidor no confirma la revocación y limpia el estado local de forma explícita.
- [x] Queda resuelta la discrepancia de alcance: Auth es requisito de Sprint 0.
- [ ] Revalidar en la base de datos objetivo el estado de las migraciones y el catálogo de 22 departamentos.
- [x] Configurar el mismo Client ID de Google en los tres ambientes Angular y compilar Staging y Production.
- [x] Restaurar y probar límites y precisión numérica en el componente `sm-input` y sus formularios consumidores.
- [x] Preparar Dockerfile y configuración como código de Railway; publicación .NET Release comprobada (sin validar imagen Docker).
- [ ] Vincular el repositorio y la raíz de servicio correcta en Railway, desplegar el API y asociar los dominios de Staging/Production a los servicios Star Médica.
- [ ] Verificar que `/Health` responda el JSON del `HealthController` con `database=connected`; no aceptar la página o respuesta genérica de Railway.
- [ ] Confirmar en Google Cloud que los orígenes web de Staging y Production están autorizados para ese Client ID.
- [ ] Configurar y verificar en API de Staging/Production `Google__ClientId`, `Jwt__Key` (mínimo 32 bytes), issuer/audience, conexión de BD y `BootstrapAdminEmail` mediante configuración protegida del ambiente; nunca guardar secretos en el repositorio.
- [ ] Completar un smoke test end-to-end en el ambiente aprobado: login Google, usuario pendiente/rol autorizado, refresh, petición autenticada y logout.
- [x] Agregar pruebas automatizadas de handlers Auth que no dependan del proveedor Google en vivo.
- [ ] Ejecutar pruebas de aceptación en staging y registrar URL, versión desplegada, fecha y resultado de smoke test.
- [x] Resolver avisos NuGet: retirar paquetes no usados y comprobar dependencias transitivas vulnerables; la auditoría local queda limpia.
- [ ] Ejecutar la validación de producción solo después de aprobar staging y revisar las variables de entorno sin publicar secretos.
- [ ] Obtener nombre, fecha y aprobación del responsable del producto para la aceptación funcional.

## Decisión actual

**Sprint 0 no se declara cerrado.** La validación local confirmó 9 migraciones aplicadas, cero cambios EF pendientes, 22 departamentos activos distintos, API/BD saludables, rutas Swagger/Auth conectadas y los estados esperados para refresh/logout sin sesión. El Client ID está configurado en los tres ambientes Angular y Staging/Production compilan. También se revalidó `sm-input`: las pruebas focalizadas (5/5) cubren conversión a número, restricciones de mínimo, máximo y paso, la opción `any`, valores vacíos y rechazo de valores numéricos inválidos. Para Auth, las pruebas confirman restauración con cookie HttpOnly sin access token local, redirección desde login según rol, limpieza ante refresh 401, consolidación de renovaciones simultáneas, reintento de solicitudes protegidas y exclusión de endpoints Auth del reintento. Un 401 tardío usa el token ya renovado en lugar de rotar otra vez; un 403 posterior al refresh conserva la sesión, mientras que un refresh fallido la expira. Si falla logout remoto, se limpia la sesión local y se muestra el aviso de revocación no confirmada; el shell oculta menú/breadcrumb protegidos. La navegación lateral comparte las definiciones de roles de las rutas y muestra solo módulos permitidos; marca y breadcrumb mantienen un destino accesible para cada perfil. La suite Angular completa pasó (74/74, incluida la prueba de carga diferida de gráficos) y el build Development pasó. AutoMapper y MailKit se retiraron del proyecto; la auditoría NuGet local ya no reporta vulnerabilidades y el build Release pasó con 0 advertencias/0 errores, con las 45 pruebas backend aprobadas. El usuario decidió dejar el despliegue para el final; por ello no se intenta ahora vincular Railway. Continúan pendientes la configuración protegida de la API, autorización de orígenes Google, smoke test Google end-to-end, validación de ambientes desplegados y aceptación firmada. Docker no está instalado, así que la imagen tampoco se ha probado localmente.

## Registro de aceptación

Completar cuando se resuelvan los criterios pendientes:

- Responsable que acepta: ______________________________
- Rol: ________________________________________________
- Ambiente y versión aceptados: _________________________
- Fecha: _____________________________________________
- Decisión: ☐ Aprobado  ☐ Rechazado  ☐ Aprobado con pendientes
- Pendientes o excepciones aceptadas: ____________________
- Firma o referencia de aprobación: ______________________

## Comandos de revalidación local

```powershell
dotnet build C:\repositorios\agente_ia\StarMedica\StarMedica.sln --configuration Release --nologo
dotnet test C:\repositorios\agente_ia\StarMedica\tests\StarMedica.Application.Tests\StarMedica.Application.Tests.csproj --nologo
Set-Location C:\repositorios\agente_ia\star-medica
npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/shared/components/sm-input/sm-input.component.spec.ts
npm run build:dev -- --no-progress
```
