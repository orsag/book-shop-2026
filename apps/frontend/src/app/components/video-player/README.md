Converting the file into base64 and decoding it directly inside PostgreSQL via psql avoids messing with Node scripts

(
echo "INSERT INTO videos (id, title, mime_type, size, data, created_at, updated_at) VALUES ("
echo "  'c9b1f2e0-2804-4b52-9df7-08d1e2e12810',"
echo "  'Salutations',"
echo "  'video/mp4',"
echo "  $(wc -c < Salutations.mp4),"
echo "  decode('"
base64 < Salutations.mp4 | tr -d '\r\n'
echo "', 'base64'),"
echo "  NOW(),"
echo "  NOW()"
echo ");"
) | docker compose exec -T -e PGPASSWORD=mypassword db psql -U myuser -d mydatabase

Verify the Insert
Run this quick check to verify that the file inserted correctly:
docker compose exec -e PGPASSWORD=mypassword db psql -U myuser -d mydatabase -c "SELECT id, title, mime_type, size, octet_length(data) FROM videos;"

Now in your Angular 22 component, set the signal to that exact UUID:
readonly videoId = signal<string>('c9b1f2e0-2804-4b52-9df7-08d1e2e12810');