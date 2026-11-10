FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["StarMedica/src/StarMedica.API/StarMedica.API.csproj", "StarMedica/src/StarMedica.API/"]
COPY ["StarMedica/src/StarMedica.Application/StarMedica.Application.csproj", "StarMedica/src/StarMedica.Application/"]
COPY ["StarMedica/src/StarMedica.Domain/StarMedica.Domain.csproj", "StarMedica/src/StarMedica.Domain/"]
COPY ["StarMedica/src/StarMedica.Infrastructure/StarMedica.Infrastructure.csproj", "StarMedica/src/StarMedica.Infrastructure/"]

RUN dotnet restore "StarMedica/src/StarMedica.API/StarMedica.API.csproj"

COPY StarMedica/src/ StarMedica/src/
WORKDIR /src/StarMedica/src/StarMedica.API
RUN dotnet publish "StarMedica.API.csproj" --configuration Release --no-restore --output /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "StarMedica.API.dll"]
