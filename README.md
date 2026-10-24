# Heap-recipes
[![Last Commit][last-commit-shield]][last-commit-url]
[![Repo Size][repo-size-shield]][repo-size-url]
[![Author1][author-shield1]][author-url1]
[![Author2][author-shield2]][author-url2]

Heap-recipes is a simple recipe website developed by <a href="https://github.com/adenholm">Hanna Adenholm</a> and <a href="https://github.com/erikpersson0884">Erik Persson</a>.

<!-- [![Build Status][build-shield]][build-url] -->

## Built with
![Vite][vite-shield]
![React][react-shield]
![Docker][docker-shield]
![TypeScript][typescript-shield]
<!-- ![Vitest][vitest-shield] -->


# Getting Started
Based on experience from Erik Persson setting it up from scratch in March 2026. A improved tutorial will come soon (hopefully)

## 1. Install dependencies

```bash
npm install
npm run setup
```

## 2. Start the database

```bash
docker compose up db
```

## 3. Backend configuration

Create the file: `appsettings.Development.json`

Replace YOUR_USERNAME and A_STRONG_PASSWORD with your PostgreSQL credentials.
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=heap_recipes;Username=YOUR_USERNAME;Password=A_STRONG_PASSWORD"
  },
  "Jwt": {
    "Key": "dev-secret-key-12345678901234567890",
    "Issuer": "HeapRecipesApi",
    "Audience": "HeapRecipesApiUsers",
    "ExpireMinutes": "60"
  }
}
```

## 4. Default user (optional)

The backend can create a default user on startup. It is only created if both a username and a password are configured, so nothing is seeded unless you set them. The user gets the `Admin` role by default.

For local development, store the credentials with [user secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) so they never end up in git. Run this from the `server` folder:

```bash
dotnet user-secrets init
dotnet user-secrets set "DefaultUser:Username" "admin"
dotnet user-secrets set "DefaultUser:Password" "pick-something-strong"
```

Start the backend and the user is created automatically. Log in with `POST /api/auth/login`.

For Docker or production, use environment variables instead (user secrets are only loaded in the `Development` environment):

```
DefaultUser__Username=admin
DefaultUser__Password=your-strong-password
```

Optionally set `DefaultUser:Role` to use a different role than `Admin`.

Where user secrets are stored on your machine:
* Windows: `%APPDATA%\Microsoft\UserSecrets\<user_secrets_id>\secrets.json`
* Linux / macOS: `~/.microsoft/usersecrets/<user_secrets_id>/secrets.json`

The `<user_secrets_id>` is the `UserSecretsId` in `server/HeapReacipesApi.csproj`. Useful commands: `dotnet user-secrets list`, `remove "Key"`, `clear`.

## 5. Expose the database locally (optional)

To set up a database for development, you may create a `docker-compose.override.yml` file with the following content:

```yaml
services:
  db:
    ports:
      - "5432:5432"
```
This will expose the docker database to port 5432 on your local machine, allowing you to connect to it

## 6. Create more users

Send a POST request to: `/api/auth/register`

Example request body:

```json
{
  "username": "Hanna",
  "password": "A_STRONG_PASSWORD"
}
```

New users registered this way get the `User` role.


# Notes

* JWT Tokens uses HS256 and must therefore be at least 32 characters, otherwise it will not work (and be insecure)
* The default user is only created once. Changing `DefaultUser:Password` later does not update an existing user, so change the password through the app or delete the row from the database.





<!-- Repo info Shields -->
[last-commit-shield]: https://img.shields.io/github/last-commit/Adenholm/heap-recipes/main?style=for-the-badge&cacheSeconds=30

[last-commit-url]: https://github.com/Adenholm/heap-recipes/commits/main

[repo-size-shield]: https://img.shields.io/github/repo-size/Adenholm/heap-recipes?style=for-the-badge&cacheSeconds=60
[repo-size-url]: https://github.com/Adenholm/heap-recipes

[author-shield1]: https://img.shields.io/badge/Author-Hanna%20Adenholm-blue?style=for-the-badge
[author-url1]: https://github.com/Adenholm

[author-shield2]: https://img.shields.io/badge/Author-Erik%20Persson-blue?style=for-the-badge
[author-url2]: https://github.com/erikpersson0884


[stars-shield]: https://img.shields.io/github/stars/Adenholm/heap-recipes?style=for-the-badge
[stars-url]: https://github.com/Adenholm/heap-recipes/stargazers

[build-shield]: https://img.shields.io/github/actions/workflow/status/Adenholm/heap-recipes/.github/workflows/tests.yml?branch=main&style=for-the-badge
[build-url]: https://github.com/Adenholm/heap-recipes/actions


<!-- Frameworks & Languages Shields -->
[vite-shield]: https://img.shields.io/badge/Vite-646CFF?logo=Vite&logoColor=white&style=for-the-badge
[react-shield]: https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white&style=for-the-badge
[next-shield]: https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white&style=for-the-badge
[vitest-shield]: https://img.shields.io/badge/Vitest-3E7CFF?logo=vitest&logoColor=white&style=for-the-badge
[prisma-shield]: https://img.shields.io/badge/Prisma-3178C6?logo=prisma&logoColor=white&style=for-the-badge
[docker-shield]: https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge
[typescript-shield]: https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge
[express-shield]: https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=for-the-badge