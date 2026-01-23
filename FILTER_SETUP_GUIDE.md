# Filter Feature - Quick Setup Guide

## What Was Added

### Frontend Components
1. **SaveFilterModal.jsx** - Modal popup for saving filters
2. **SaveFilterModal.css** - Styling for save filter modal
3. **FilterSidebar.jsx** - Left sidebar showing saved filters
4. **FilterSidebar.css** - Styling for sidebar
5. **Development.jsx** - Updated with filter save/load functionality

### Backend
1. **SavedFilter.js** - MongoDB model for saved filters
2. **filters.js** - API routes for filter operations
3. **index.js** - Updated server file with filters route

---

## How to Test

### 1. Start Backend
```bash
cd server
npm install  # if needed
npm start
```

### 2. Start Frontend
```bash
cd my-react-app
npm install  # if needed
npm run dev
```

### 3. Test the Feature

#### Save a Filter:
1. Navigate to Development page
2. Click the **Filter** button to open filter panel
3. Enter filter values (e.g., Status = "Active")
4. Click **"Save as"** button (appears after filtering)
5. Enter a filter name in popup (e.g., "Active Tasks")
6. Click "Save Filter"
7. See confirmation message

#### View Saved Filters:
1. Look at the left sidebar
2. You should see "Saved Filters" section
3. Your saved filter appears in the list

#### Apply a Saved Filter:
1. Click on any saved filter in the sidebar
2. The filter automatically applies to the table
3. The filter item highlights in blue

#### Delete a Filter:
1. Hover over a filter in the sidebar
2. Click the trash icon
3. Confirm deletion
4. Filter is removed

---

## API Endpoints

All endpoints use `/api/filters` base path:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/` | Create new filter |
| GET | `/user/:userId` | Get all user's filters |
| GET | `/:filterId` | Get specific filter |
| PATCH | `/:filterId` | Update filter |
| DELETE | `/:filterId` | Delete filter |

---

## State Management Flow

```
User applies filters
        ↓
    setFilters(...)
        ↓
    "Save as" button visible
        ↓
User clicks "Save as"
        ↓
SaveFilterModal opens
        ↓
User enters name and saves
        ↓
handleSaveFilter() → API POST
        ↓
FilterSidebar fetches from /api/filters/user/:userId
        ↓
New filter appears in sidebar
        ↓
User can click to apply or delete
```

---

## Component Props Reference

### SaveFilterModal
```jsx
<SaveFilterModal
    isOpen={boolean}                    // Control visibility
    onClose={() => {}}                  // Called when modal closes
    onSave={(name, filters) => {}}      // Called when filter saved
    filters={{key: value}}              // Current filters to display
/>
```

### FilterSidebar
```jsx
<FilterSidebar
    onFilterSelect={(filterData) => {}} // Called when filter clicked
    currentFilters={{key: value}}       // Highlight active filter
/>
```

---

## Common Issues & Solutions

### Issue: Sidebar not showing
- Check if user is logged in (filters are per-user)
- Verify filters route is added to server/index.js
- Check browser console for errors

### Issue: Save filter button not appearing
- Make sure at least one filter is applied
- Check that filters object is not empty

### Issue: Saved filter not persisting
- Verify MongoDB connection is working
- Check that user._id is correctly retrieved from localStorage
- Look for API errors in network tab

### Issue: Sidebar filters not loading
- Check network requests in browser DevTools
- Verify the API endpoint returns data
- Clear browser cache and reload

---

## Customization Options

### Change Sidebar Width
In `FilterSidebar.css`:
```css
.filter-sidebar {
    width: 250px; /* Change this value */
}
```

### Change Sidebar Colors
In `FilterSidebar.css`:
```css
.filter-sidebar {
    background-color: #f8f9fa; /* Background */
}

.filter-item:hover {
    background-color: #f0f7ff; /* Hover */
    border-color: #007bff;
}
```

### Adjust Modal Width
In `SaveFilterModal.css`:
```css
.save-filter-modal {
    max-width: 450px; /* Change this value */
}
```

---

## Database Schema

The SavedFilter collection will look like:
```javascript
{
  "_id": ObjectId,
  "userId": ObjectId,
  "filterName": "High Priority Tasks",
  "filterData": {
    "status": "Active",
    "priority": "High"
  },
  "department": "Development",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

---

## Performance Notes

- Filters are fetched once per page load for each user
- Filtered data is calculated in memory using useMemo
- Sidebar is collapsible to save screen space
- Lazy loading for large filter lists (if needed)

---

## Security Considerations

✅ Filters are user-specific (userId in schema)
✅ Only users can see their own filters
✅ Input validation on filter name
✅ Error handling for failed operations

---

## Next Steps

1. Test all functionality
2. Customize styling to match your design
3. Add more filter conditions as needed
4. Consider adding filter sharing features
5. Monitor database for performance

---

## Support

For issues or questions:
1. Check the detailed documentation: FILTER_FEATURE_DOCUMENTATION.md
2. Review browser console for error messages
3. Check network tab in DevTools for API issues
4. Verify all files are created correctly
