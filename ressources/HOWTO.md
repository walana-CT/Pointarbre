# Useful links



# Database

## reset DB
launch project with `make vdown ; make`

## explore DB

### accès à admin container (consulter la base de donnée)
http://localhost:8080/
- system `postgresql`
- server `postgres:5432`
- user `alice`
- pass `caglisse`
- database `pointarbre`

### Aller dans la base de donnée en SQL:
`docker exec -it postgres psql -U alice -d pointarbre`

### Mailpit
http://localhost:8025/