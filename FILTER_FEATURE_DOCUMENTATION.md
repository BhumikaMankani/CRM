# Filter Save & Sidebar Feature Documentation

## Overview
This feature allows users to:
1. Apply filters to data
2. Save filtered states with custom names
3. View saved filters in a left sidebar
4. Load saved filters by clicking on them
5. Delete unwanted filters

---

## Components Created

### 1. **SaveFilterModal** (`SaveFilterModal.jsx`)
A popup modal that appears when user clicks "Save as" button to save current filters.

**Features:**
- Input field for filter name
- Preview of applied filters
- Error handling for empty names or no active filters
- Success feedback

**Props:**
- `isOpen`: Boolean to control modal visibility
- `onClose`: Callback function when modal closes
- `onSave`: Callback function with `(filterName, filters)` parameters
- `filters`: Current filter object to display

**Usage:**
```jsx
<SaveFilterModal
    isOpen={isSaveFilterModalOpen}
    onClose={() => setIsSaveFilterModalOpen(false)}
    onSave={handleSaveFilter}
    filters={filters}
/>
```

---

### 2. **FilterSidebar** (`FilterSidebar.jsx`)
Left sidebar component displaying all saved filters for the current user.

**Features:**
- Collapsible/expandable sidebar with toggle button
- List of saved filters with count of applied conditions
- Highlight active filter (currently applied)
- Delete functionality for individual filters
- Loading states and error handling
- Auto-fetches filters on component mount
- Responsive design

**Props:**
- `onFilterSelect`: Callback function with `(filterData)` parameters
- `currentFilters`: Current active filters object to highlight

**Usage:**
```jsx
<FilterSidebar
    onFilterSelect={handleFilterSelect}
    currentFilters={filters}
/>
```

---

### 3. **SavedFilter Model** (`server/models/SavedFilter.js`)
MongoDB schema for storing user's saved filters.

**Schema Fields:**
```javascript
{
  userId: ObjectId (reference to User),
  filterName: String (required),
  filterData: Object (filter conditions),
  department: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

---

### 4. **Filters Routes** (`server/routes/filters.js`)
RESTful API endpoints for filter operations.

**Endpoints:**

#### POST `/api/filters`
Create a new saved filter
```javascript
{
  userId: "user_id",
  filterName: "High Priority Tasks",
  filterData: { priority: "High", status: "Active" }
}
```

#### GET `/api/filters/user/:userId`
Fetch all saved filters for a user

#### GET `/api/filters/:filterId`
Fetch a specific saved filter

#### PATCH `/api/filters/:filterId`
Update a saved filter
```javascript
{
  filterName: "Updated Name",
  filterData: { /* new filter data */ }
}
```

#### DELETE `/api/filters/:filterId`
Delete a saved filter

---

## Integration in Development Component

### State Management
```jsx
const [filters, setFilters] = useState({}); // Current filters
const [isSaveFilterModalOpen, setIsSaveFilterModalOpen] = useState(false); // Modal visibility
```

### Key Functions

#### `handleSaveFilter(filterName, filterData)`
Saves current filters to database with given name.
```jsx
const handleSaveFilter = async (filterName, filterData) => {
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);

    const response = await fetch(`${API_URL}/api/filters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user._id,
            filterName,
            filterData
        })
    });
};
```

#### `handleFilterSelect(filterData)`
Applies a saved filter to the current view.
```jsx
const handleFilterSelect = (filterData) => {
    setFilters(filterData);
    setIsFilterOpen(true);
};
```

### UI Buttons
- **"Filter" button**: Toggle filter panel
- **"Save as" button**: Opens SaveFilterModal (visible when filters are active)
- **"Clear All" button**: Clears all applied filters

---

## Styling

### SaveFilterModal CSS (`SaveFilterModal.css`)
- Modal overlay with backdrop
- Form inputs and labels
- Filter preview with tags
- Footer with Cancel/Save buttons
- Responsive design

### FilterSidebar CSS (`FilterSidebar.css`)
- Fixed left sidebar (250px width)
- Collapsible with smooth transitions
- Filter items with hover states
- Active filter highlighting
- Delete button with danger color
- Responsive mobile layout
- Custom scrollbar styling

---

## Workflow

### Save Filter
1. User applies filters using the filter panel
2. "Save as" button appears when filters are active
3. User clicks "Save as"
4. SaveFilterModal popup appears
5. User enters filter name and clicks "Save Filter"
6. Filter is saved to database
7. Sidebar updates with new filter

### Load Filter
1. User opens sidebar or clicks toggle button
2. Sidebar displays all saved filters
3. User clicks on a filter name
4. Filter automatically applies to the table
5. Active filter is highlighted with blue background
6. "Clear All" button appears to remove filters

### Delete Filter
1. User hovers over filter in sidebar
2. Trash icon appears on the right
3. User clicks trash icon
4. Confirmation dialog appears
5. User confirms deletion
6. Filter is removed from database and sidebar

---

## File Structure
```
my-react-app/src/components/
├── Development.jsx (Main component - updated)
├── SaveFilterModal.jsx (NEW)
├── SaveFilterModal.css (NEW)
├── FilterSidebar.jsx (NEW)
├── FilterSidebar.css (NEW)
└── ... other components

server/
├── models/
│   ├── SavedFilter.js (NEW)
│   └── ... other models
├── routes/
│   ├── filters.js (NEW)
│   └── ... other routes
└── index.js (UPDATED - added filters route)
```

---

## Key Features

✅ Save filters with custom names
✅ View all saved filters in sidebar
✅ Load filters by clicking sidebar items
✅ Delete filters
✅ Filter preview before saving
✅ Highlight active filter
✅ Collapsible sidebar
✅ User-specific filters (per userId)
✅ Error handling and validation
✅ Responsive design
✅ Loading states
✅ Smooth animations and transitions

---

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Future Enhancements
- Filter editing (rename, modify conditions)
- Filter sharing between users
- Filter history/versions
- Filter export/import
- Filter tags/categories
- Smart filter suggestions
- Filter usage analytics
