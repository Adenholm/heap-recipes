# Heap-recipes
## Heap-recipes is a simple recipe website developed together with <a href="https://github.com/adenholm">my beloved girlfriend</a>.

![Github version](https://img.shields.io/badge/version-0.0.0-darkblue?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/erikpersson0884/heap-recipes?color=blue&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/erikpersson0884/heap-recipes?color=darkgreen&style=flat-square) 
<a style="text-decoration: none !important; display:inline;" href="https://github.com/erikpersson0884">![Github author](https://img.shields.io/badge/Author-erikpersson0884-darkred?style=flat-square)</a>
<a style="text-decoration: none !important; display:inline;" href="https://github.com/adenholm">![Github author](https://img.shields.io/badge/Author-Hanna_Adenholm-darkred?style=flat-square)</a>


#Setup

1. install packges 

```
 npm install
 npm run setup
``` 

2. 
start database
```
docker compose up db
```

3. configuration - add server/appsettings.json
```
{
    "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Port=5432;Database=heap_recipes;Username=heap_user;Password=superduperpassword"
    },
    "Jwt": {
        "Key": "dev-secret-key-12345678901234567890", 
        "Issuer": "HeapRecipesApi",
        "Audience": "HeapRecipesApiUsers",
        "ExpireMinutes": "60"
    }
}
```

4. 
to create a user send a post call to the ´api/auth/register´ endpoint with the following body: 
```
{
    "id": 1,
    "username": "erik"
}
```


# Info

What types/roles of users are there? 
* User