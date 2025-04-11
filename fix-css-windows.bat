@echo off
echo Fixing CSS dependencies for Next.js in Docker...

echo Stopping containers...
docker-compose -f docker-compose.logs.yml down

echo Removing images...
for /f "tokens=3" %%i in ('docker images ^| findstr "neurallog"') do docker rmi -f %%i

echo Rebuilding with minimal Dockerfile...
docker-compose -f docker-compose.logs.yml up -d --build --force-recreate

echo Running fix script inside container...
docker-compose -f docker-compose.logs.yml exec web fix-css-deps

echo Checking if autoprefixer is installed...
docker-compose -f docker-compose.logs.yml exec web npm list autoprefixer

echo Fix completed! If you still see errors, try running:
echo npm run docker:clean-rebuild

pause
