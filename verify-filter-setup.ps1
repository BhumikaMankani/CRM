# Filter Feature Verification Script (Windows PowerShell)

Write-Host "🔍 Checking Filter Feature Setup..." -ForegroundColor Cyan
Write-Host ""

# Check if backend files exist
Write-Host "📂 Checking Backend Files..." -ForegroundColor Yellow
if (Test-Path ".\server\models\SavedFilter.js") {
    Write-Host "✅ SavedFilter.js model exists" -ForegroundColor Green
} else {
    Write-Host "❌ SavedFilter.js model MISSING" -ForegroundColor Red
}

if (Test-Path ".\server\routes\filters.js") {
    Write-Host "✅ filters.js route exists" -ForegroundColor Green
} else {
    Write-Host "❌ filters.js route MISSING" -ForegroundColor Red
}

# Check if frontend files exist
Write-Host ""
Write-Host "📂 Checking Frontend Files..." -ForegroundColor Yellow
if (Test-Path ".\my-react-app\src\components\SaveFilterModal.jsx") {
    Write-Host "✅ SaveFilterModal.jsx exists" -ForegroundColor Green
} else {
    Write-Host "❌ SaveFilterModal.jsx MISSING" -ForegroundColor Red
}

if (Test-Path ".\my-react-app\src\components\FilterSidebar.jsx") {
    Write-Host "✅ FilterSidebar.jsx exists" -ForegroundColor Green
} else {
    Write-Host "❌ FilterSidebar.jsx MISSING" -ForegroundColor Red
}

if (Test-Path ".\my-react-app\src\components\SaveFilterModal.css") {
    Write-Host "✅ SaveFilterModal.css exists" -ForegroundColor Green
} else {
    Write-Host "❌ SaveFilterModal.css MISSING" -ForegroundColor Red
}

if (Test-Path ".\my-react-app\src\components\FilterSidebar.css") {
    Write-Host "✅ FilterSidebar.css exists" -ForegroundColor Green
} else {
    Write-Host "❌ FilterSidebar.css MISSING" -ForegroundColor Red
}

# Check if Development.jsx has the functions
Write-Host ""
Write-Host "🔎 Checking Development.jsx Functions..." -ForegroundColor Yellow
$devContent = Get-Content ".\my-react-app\src\components\Development.jsx" -Raw

if ($devContent -match "handleSaveFilter") {
    Write-Host "✅ handleSaveFilter function exists" -ForegroundColor Green
} else {
    Write-Host "❌ handleSaveFilter function MISSING" -ForegroundColor Red
}

if ($devContent -match "handleFilterSelect") {
    Write-Host "✅ handleFilterSelect function exists" -ForegroundColor Green
} else {
    Write-Host "❌ handleFilterSelect function MISSING" -ForegroundColor Red
}

if ($devContent -match "SaveFilterModal") {
    Write-Host "✅ SaveFilterModal component imported" -ForegroundColor Green
} else {
    Write-Host "❌ SaveFilterModal component NOT imported" -ForegroundColor Red
}

if ($devContent -match "FilterSidebar") {
    Write-Host "✅ FilterSidebar component imported" -ForegroundColor Green
} else {
    Write-Host "❌ FilterSidebar component NOT imported" -ForegroundColor Red
}

# Check if server/index.js has the route
Write-Host ""
Write-Host "🔎 Checking server/index.js..." -ForegroundColor Yellow
$serverContent = Get-Content ".\server\index.js" -Raw

if ($serverContent -match "Filters") {
    Write-Host "✅ Filters import found" -ForegroundColor Green
} else {
    Write-Host "❌ Filters import MISSING" -ForegroundColor Red
}

if ($serverContent -match '"/api/filters"') {
    Write-Host "✅ Filters route registered" -ForegroundColor Green
} else {
    Write-Host "❌ Filters route NOT registered" -ForegroundColor Red
}

# Check package.json for required packages
Write-Host ""
Write-Host "📦 Checking Dependencies..." -ForegroundColor Yellow

$packageContent = Get-Content ".\my-react-app\package.json" -Raw
if ($packageContent -match "react-icons") {
    Write-Host "✅ react-icons package installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  react-icons may need to be installed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Verification Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. cd server" -ForegroundColor White
Write-Host "2. npm install (if needed)" -ForegroundColor White
Write-Host "3. npm start" -ForegroundColor White
Write-Host ""
Write-Host "In another terminal:" -ForegroundColor Green
Write-Host "1. cd my-react-app" -ForegroundColor White
Write-Host "2. npm run dev" -ForegroundColor White
