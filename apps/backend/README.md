Generate password hash manually
node -e "console.log(require('bcryptjs').hashSync('your_secure_password', 10))"

Access database
db - service name (defined in docker-compose.yml)
docker compose exec db psql -U your_db_user -d your_db_name

UPDATE "User"
SET password = 'HACH_CODE'
WHERE username = 'bossman';

docker compose exec devel psql -U myuser -d mydatabase
