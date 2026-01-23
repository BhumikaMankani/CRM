# 🆘 FILTER ERROR - SIMPLE FIXES

## You See: "Error saving filter: Error: Failed to save filter"

### ⚡ Try This First (Takes 1 Minute):

```powershell
# 1. Stop everything (Ctrl+C in both terminals)

# 2. Terminal 1:
cd server
npm start

# 3. Terminal 2 (new one):
cd my-react-app
npm run dev

# 4. Browser: Clear cache (F12 → Application → Clear all site data)

# 5. Refresh page and try again
```

---

## If Still Not Working:

### Check #1: Is backend running?
```
Look at server terminal, should show:
✅ Mongo connected successfully
Backend is working on 5000
```

❌ **If not** → Do the restart above

---

### Check #2: Is user logged in?
```
F12 → Application → Local Storage → look for "user"
Should have _id field
```

❌ **If not** → Log out and log in again

---

### Check #3: Did you apply a filter?
```
Must click a filter field first before "Save as" appears
```

❌ **If not** → Apply a filter first

---

### Check #4: What does network say?
```
F12 → Network tab
Click "Save Filter"
Find the request to /api/filters
```

**Status 201 or 200?** ✅ Success! (Check sidebar)

**Status 404?** ❌ Backend route not registered
- Fix: Restart server

**Status 500?** ❌ Backend error
- Check server terminal for error message

**Status 400?** ❌ Bad data
- Make sure filter name is entered and filters applied

**No request?** ❌ Backend not running
- Restart backend

---

## Fastest Fix Path:

1. **Restart both backend and frontend** (see above)
2. **Clear browser cache** (F12 → Application → Clear all)
3. **Refresh page** and try again
4. **Check Network tab** (F12 → Network) - what status code?
5. **Report the status code** if still broken

---

## Common Status Codes:

| Code | Meaning | Fix |
|------|---------|-----|
| **201** | ✅ Saved! | Check sidebar for filter |
| **400** | Bad data | Enter filter name & apply filters |
| **404** | Not found | Restart backend |
| **500** | Server error | Check server console |
| None | No backend | Start backend |

---

**👉 Do the restart steps above first - fixes 90% of issues!**
