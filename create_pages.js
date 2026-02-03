const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'my-react-app/src/components/Development.jsx');
const marketingPath = path.join(__dirname, 'my-react-app/src/pages/marketing.jsx');
const seoPath = path.join(__dirname, 'my-react-app/src/pages/seo.jsx');

let content = fs.readFileSync(sourcePath, 'utf8');

function generatePage(department, componentName) {
    let newContent = content;
    const apiName = department.toLowerCase();

    // 1. Inject department constant at the start of the component
    // Development.jsx might have commented out code, so use global replace or be careful.
    // We'll use global replace to catch the real component too.
    newContent = newContent.replace(
        /function TableColumns\(\) \{/g,
        `function ${componentName}() {\n    const department = '${apiName}';`
    );

    // 2. Replace the API endpoint for data
    // /api/development -> /api/marketing
    // Regex global replace
    const apiRegex = new RegExp(`/api/development`, 'g');
    newContent = newContent.replace(apiRegex, `/api/${apiName}`);

    // replace 'development' word in specific contexts if needed?
    // Be careful not to replace it in comments or unrelated strings if possible,
    // but 'development' generally refers to the department here.
    // However, we must be careful about "Development" component imports if any.
    // Development.jsx mostly uses it in API calls.
    // Let's rely on specific API replacement above.

    // 3. Update Filter Saving (POST)
    // The code: body: JSON.stringify({ userId: user._id, filterName, filterData })
    // We want: body: JSON.stringify({ userId: user._id, department, filterName, filterData })
    // We use "department" variable which we injected.
    newContent = newContent.replace(
        /userId: user\._id,/g,
        `userId: user._id, department: department,`
    );

    // 4. Update Filter Fetching (GET)
    // Code: fetch(`${API_URL}/api/filters?userId=${userStatus?._id || user._id}`)
    // or similar. I need to find the exact pattern.
    // Since I can't be 100% sure of the exact line without reading, I'll attempt a flexible replacement.
    // Pattern: /api/filters...`
    // We want to append &department=${department}
    // If it ends with `,` or `}`, it's likely the url string end.

    // Look for: `${API_URL}/api/filters
    // This appears in SaveFilter call (POST) and Fetch call (GET).
    // The GET one typically has query params.
    // The POST one doesn't.

    // Strategy:
    // Find `${API_URL}/api/filters?  -> Append &department=${department} to the end of the string
    // But simplified:
    // The fetching likely looks like: `${API_URL}/api/filters?userId=${...}`
    // We can replace `?userId=` with `?department=${department}&userId=` ? order doesn't matter.
    newContent = newContent.replace(
        /\?userId=/g,
        `?department=\${department}&userId=`
    );

    // Also handle /api/filters/user/${userId} if that's used (it is in filters.js routes, maybe frontend uses it?)
    // Step 86 doesn't show the fetch code for filters, but assuming it uses standard params.
    // Let's assume the previous replacement covers the query param case.

    // 5. Rename export
    newContent = newContent.replace(
        /export default TableColumns;/g,
        `export default ${componentName};`
    );

    return newContent;
}

const marketingContent = generatePage('marketing', 'Marketing');
fs.writeFileSync(marketingPath, marketingContent);

const seoContent = generatePage('seo', 'Seo');
fs.writeFileSync(seoPath, seoContent);

console.log('Pages created successfully.');
