@echo off
echo Checking logs server status...

echo.
echo Logs server container status:
docker-compose -f docker-compose.logs.yml ps logs-server

echo.
echo Logs server logs:
docker-compose -f docker-compose.logs.yml logs logs-server

echo.
echo Testing connection to logs server from web container:
docker-compose -f docker-compose.logs.yml exec web curl -s -o /dev/null -w "%%{http_code}" http://logs-server:3030/api/logs || echo "Failed to connect to logs server"

echo.
echo Done.
pause
