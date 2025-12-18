@echo off
echo Building Handy Eddie Client...
cd client
call npm install
call npm run build
cd ..
echo.
echo Client build complete! The built files are in handy-eddie\wwwroot
echo You can now run the .NET application.
pause
