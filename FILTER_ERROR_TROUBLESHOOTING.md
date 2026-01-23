# Filter Save Error - Troubleshooting Guide

## Quick Fix Steps

### Step 1: Restart the Backend Server
The most common cause is that the server wasn't restarted after adding the new routes.

```bash
# Terminal 1 - Stop current server (Ctrl+C)
# Then:
cd server
npm install  # Install any missing dependencies
npm start    # Restart the server
```

### Step 2: Verify MongoDB Connection
Make sure MongoDB is running:
```bash
# Check if MongoDB is running
# If using MongoDB Atlas, verify connection string in .env
# Look for: "✅ Mongo connected successfully" message in server console
```

### Step 3: Test the API Endpoint
Open your browser and test the API:
```
http://localhost:5000/api/ping
```
You should see: `{"message":"pong"}`

### Step 4: Check Console Errors
In browser DevTools:
1. Open Console tab (F12)
2. Look for any error messages
3. Check Network tab for failed requests
4. Look for 404, 500, or other error codes

---

## Common Issues & Solutions

### Issue 1: "Failed to save filter" Error
**Cause:** Backend server not restarted or route not registered

**Solution:**
```bash
# Stop the server (Ctrl+C)
# Restart it:
npm start
```

**Verify:** Look for these messages in server console:
```
✅ Mongo connected successfully
[API Request] POST /api/filters
Backend is working on 5000
```

---

### Issue 2: "User information not found"
**Cause:** Not logged in or user data not in localStorage

**Solution:**
1. Make sure you're logged in
2. Check localStorage in DevTools:
   - F12 → Application → Storage → Local Storage
   - Look for 'user' key
   - It should contain `_id` field

---

### Issue 3: 400 Bad Request
**Cause:** Missing required fields (userId, filterName, or filterData)

**Check in SaveFilterModal:**
1. Filter name is entered (not empty)
2. At least one filter is applied

---

### Issue 4: 500 Internal Server Error
**Cause:** MongoDB issue or SavedFilter model not loaded

**Solutions:**
1. Check server console for detailed error
2. Verify SavedFilter.js exists in `server/models/`
3. Verify filters.js exists in `server/routes/`
4. Check Filters import in `server/index.js`

---

## Debug Checklist

- [ ] Backend server is running (check terminal)
- [ ] "Mongo connected successfully" appears in logs
- [ ] filters.js route file exists in server/routes/
- [ ] SavedFilter.js model exists in server/models/
- [ ] Filters import added to server/index.js
- [ ] User is logged in and has _id in localStorage
- [ ] At least one filter is applied before saving
- [ ] Filter name is entered in the modal

---

## Manual API Testing

### Using curl or Postman

**Test endpoint (replace with your user _id):**
```bash
curl -X POST http://localhost:5000/api/filters \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID_HERE",
    "filterName": "Test Filter",
    "filterData": {"status": "active"}
  }'
```

Expected response:
```json
{
  "_id": "...",
  "userId": "YOUR_USER_ID_HERE",
  "filterName": "Test Filter",
  "filterData": {"status": "active"},
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## Browser DevTools Network Debugging

### To see API call details:

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Click "Save as" button**
4. **Find the POST request** to `/api/filters`
5. **Click it and check:**
   - **Request:** See what data was sent
   - **Response:** See server's response
   - **Status:** Should be 201 (Created)

### Expected Network Request:
```
POST /api/filters HTTP/1.1
Content-Type: application/json

{
  "userId": "...",
  "filterName": "My Filter",
  "filterData": {"priority": "High"}
}
```

### Expected Response (201):
```json
{
  "_id": "6...",
  "userId": "...",
  "filterName": "My Filter",
  "filterData": {"priority": "High"},
  "createdAt": "2026-01-23T...",
  "updatedAt": "2026-01-23T..."
}
```

---

## File Verification

Make sure these files exist:

### Frontend Files:
- ✅ `my-react-app/src/components/SaveFilterModal.jsx`
- ✅ `my-react-app/src/components/SaveFilterModal.css`
- ✅ `my-react-app/src/components/FilterSidebar.jsx`
- ✅ `my-react-app/src/components/FilterSidebar.css`
- ✅ `my-react-app/src/components/Development.jsx` (updated)

### Backend Files:
- ✅ `server/models/SavedFilter.js`
- ✅ `server/routes/filters.js`
- ✅ `server/index.js` (updated with Filters import and route)

---

## Environment Variables Check

Make sure `.env` in server folder has:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

---

## Complete Restart Process

1. **Stop Backend:**
   ```bash
   # In server terminal
   Ctrl+C
   ```

2. **Stop Frontend:**
   ```bash
   # In my-react-app terminal
   Ctrl+C
   ```

3. **Restart Backend:**
   ```bash
   cd server
   npm start
   ```

4. **Restart Frontend:**
   ```bash
   cd my-react-app
   npm run dev
   ```

5. **Clear Browser Cache:**
   - F12 → Application → Clear all site data
   - Refresh the page

---

## Detailed Error Analysis

When you see an error, check these in order:

1. **Backend Console:**
   - Is server running?
   - Any error messages?
   - Is MongoDB connected?

2. **Browser Console:**
   - Any JavaScript errors?
   - What error message is shown?

3. **Network Tab (F12):**
   - What's the status code? (201=success, 400=bad data, 500=server error)
   - What's the response body?

4. **Application Tab (F12):**
   - Is user data in localStorage?
   - Does user have _id?

---

## Success Signs

When everything is working:

1. ✅ "Filter saved successfully!" message appears
2. ✅ Sidebar updates with new filter
3. ✅ Network request shows 201 status
4. ✅ Server logs show `[API Request] POST /api/filters`

---

## Next Actions

1. **Follow the Quick Fix Steps above**
2. **Verify all files are in place**
3. **Restart both backend and frontend**
4. **Clear browser cache**
5. **Test again**

If you still get an error, please share:
- The exact error message
- Server console output
- Browser console errors (screenshot)
- Network tab response (screenshot)
