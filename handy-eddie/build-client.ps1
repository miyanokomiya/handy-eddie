Write-Host "Building Handy Eddie Client..." -ForegroundColor Cyan
Set-Location client

Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`nBuilding client..." -ForegroundColor Yellow
npm run build

Set-Location ..

Write-Host "`nClient build complete!" -ForegroundColor Green
Write-Host "The built files are in handy-eddie\wwwroot" -ForegroundColor Green
Write-Host "You can now run the .NET application." -ForegroundColor Green
