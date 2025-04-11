@echo off
echo Rebuilding Docker container with Node.js 22...

echo Stopping containers...
docker-compose -f docker-compose.logs.yml down

echo Removing images...
for /f "tokens=3" %%i in ('docker images ^| findstr "neurallog"') do docker rmi -f %%i

echo Building and starting containers...
docker-compose -f docker-compose.logs.yml up -d --build

echo Container rebuild completed!
echo.
echo To view logs:
echo docker-compose -f docker-compose.logs.yml logs -f web

pause
