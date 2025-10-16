# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Update CA certificates
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

# Stage 2: Run
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "HeapReacipesApi.dll"]
