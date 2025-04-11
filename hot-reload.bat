@echo off
echo Setting up hot reloading for development...

echo Stopping containers...
docker-compose -f docker-compose.logs.yml down

echo Building and starting all containers...
docker-compose -f docker-compose.logs.yml up -d --build

echo Container setup completed!
echo.
echo Your application should now be running with hot reloading.
echo Any changes you make to the source files will be automatically reflected.
echo.
echo To view logs:
echo docker-compose -f docker-compose.logs.yml logs -f web
echo.
echo To stop the containers:
echo docker-compose -f docker-compose.logs.yml down

pause
