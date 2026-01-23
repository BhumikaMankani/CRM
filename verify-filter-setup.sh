#!/bin/bash
# Filter Feature Verification Script

echo "🔍 Checking Filter Feature Setup..."
echo ""

# Check if backend files exist
echo "📂 Checking Backend Files..."
if [ -f "./server/models/SavedFilter.js" ]; then
    echo "✅ SavedFilter.js model exists"
else
    echo "❌ SavedFilter.js model MISSING"
fi

if [ -f "./server/routes/filters.js" ]; then
    echo "✅ filters.js route exists"
else
    echo "❌ filters.js route MISSING"
fi

# Check if frontend files exist
echo ""
echo "📂 Checking Frontend Files..."
if [ -f "./my-react-app/src/components/SaveFilterModal.jsx" ]; then
    echo "✅ SaveFilterModal.jsx exists"
else
    echo "❌ SaveFilterModal.jsx MISSING"
fi

if [ -f "./my-react-app/src/components/FilterSidebar.jsx" ]; then
    echo "✅ FilterSidebar.jsx exists"
else
    echo "❌ FilterSidebar.jsx MISSING"
fi

# Check if Development.jsx has the functions
echo ""
echo "🔎 Checking Development.jsx Functions..."
if grep -q "handleSaveFilter" ./my-react-app/src/components/Development.jsx; then
    echo "✅ handleSaveFilter function exists"
else
    echo "❌ handleSaveFilter function MISSING"
fi

if grep -q "handleFilterSelect" ./my-react-app/src/components/Development.jsx; then
    echo "✅ handleFilterSelect function exists"
else
    echo "❌ handleFilterSelect function MISSING"
fi

# Check if server/index.js has the route
echo ""
echo "🔎 Checking server/index.js..."
if grep -q "Filters" ./server/index.js; then
    echo "✅ Filters import found"
else
    echo "❌ Filters import MISSING"
fi

if grep -q "/api/filters" ./server/index.js; then
    echo "✅ Filters route registered"
else
    echo "❌ Filters route NOT registered"
fi

echo ""
echo "✨ Verification Complete!"
echo ""
echo "Next Steps:"
echo "1. npm install (in server folder if needed)"
echo "2. npm start (in server folder)"
echo "3. npm run dev (in my-react-app folder in another terminal)"
