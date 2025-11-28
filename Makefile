# ----------------------
# Docker commands
# ----------------------

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

restart:
	docker compose down && docker compose up -d

vdown:
	docker compose down -v

clean: vdown
	docker system prune -a -f

# ----------------------
# Prisma commands
# ----------------------

# Exécuter UNE migration (tu choisis le nom)
migrate:
	docker compose exec pointarbre_server npx prisma migrate dev --name $(name)

# Générer Prisma Client
generate:
	docker compose exec pointarbre_server npx prisma generate

# Pull depuis la DB → met à jour schema.prisma
pull:
	docker compose exec pointarbre_server npx prisma db pull

# Studio (super pratique)
studio:
	docker compose exec -it pointarbre_server npx prisma studio