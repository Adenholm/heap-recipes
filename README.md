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

2. Start the database
```bash
docker compose up db
```

3. Backend configuration

Create the file: `server/appsettings.json`

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



5. To set up a database for development, you may create a ´´´docker-compose.override.yml´´´ file with the following content:

```yaml
services:
  db:
    ports:
      - "5432:5432"
```
This will expose the docker database to port 5432 on your local machine, allowing you to connect to it

6. Create a user

Send a POST request to: `/api/auth/register`

Example request body:

```
{
  "id": 1,
  "username": "Hanna"
}
```


# Notes

* JWT Tokens uses HS256 and must therefore be at least 32 characters, otherwise it will not work (and be insecure)





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
