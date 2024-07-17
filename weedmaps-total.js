(async function () {

    let fetch;
    let XLSX;
    try {
        const fetchModule = await import('node-fetch');
        const XLSXModule = await import('xlsx');
        fetch = fetchModule.default;
        XLSX = XLSXModule.default;
    } catch (err) {
        fetch = require('node-fetch');
        XLSX = require('xlsx');
    }

    const excludedEmail = 'tom@slocalroots.store'; // Define the email address to exclude
    const uniqueEmails = new Set();
    const filteredData = [];

    const fetchData = async (url) => {
        const res = await fetch(url, {
            "headers": {
                "accept": "*/*, application/json",
                "accept-language": "en-US,en;q=0.9",
                "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "wm-anonymous-user-id": "3923620a-9a2d-4534-a8e5-ee6460c495d6",
                "wm-user-latlng": "39.19025,-105.605, 39.19025,-105.605",
                "x-px-cookies": "_px2=eyJ1IjoiYjQ0MWE1NDAtMTQ4ZC0xMWVmLTgwZDktNDU2MmEyY2ZlYjQ0IiwidiI6ImYzMTI5NzhmLWYxZmYtMTFlZS1hYTA4LWE0YTNmZmYzOTZjNiIsInQiOjE3MTU5Nzg3MzU3NTEsImgiOiJkZDc0ODFhZGRjY2NmYmEwYjg5ZDNmZDRlZDZjZDY3ZjFlY2NjMzYxYWI2ODgxNmE2YzA1MzRiNDMwMzg0MDc3In0=",
                "Referer": "https://weedmaps.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        });
        return await res.json();
    };

    const fetchDataAndProcess = async (url) => {
        const data = await fetchData(url);

        if (data && data.data && Array.isArray(data.data.listings)) {
            data.data.listings.forEach(listing => {
                // Check if the email is unique before adding it to the filteredData array
                if (listing.email !== excludedEmail && !uniqueEmails.has(listing.email) && listing.state !== 'ON') {
                    uniqueEmails.add(listing.email);
                    filteredData.push({
                        id: listing.id,
                        name: listing.name,
                        city: listing.city,
                        state: listing.state,
                        email: listing.email.toLowerCase(),
                        phone_number: listing.phone_number,
                        accepts_cc: listing.accepts_credit_cards
                        // Add more fields as needed
                    });
                }
            });
        } else {
            console.error("Invalid API response format or no listings found:", data);
        }
    };

    // Scrape multiple pages (example: 5 pages)
    for (let i = 1; i <= 10; i++) {
        const url = `https://api-g.weedmaps.com/discovery/v2/listings?latlng=35.656643%2C-97.46569&sort_by=position_distance&page=${i}&page_size=100&filter%5Bany_retailer_services%5D%5B%5D=storefront&filter%5Bbounding_radius%5D=500mi&filter%5Bbounding_latlng%5D=35.656643%2C-97.46569&include%5B%5D=facets.has_curbside_pickup&include%5B%5D=facets.retailer_services&include%5B%5D=listings.top_deals`;
        await fetchDataAndProcess(url);
    }

    // Read existing data from the file
    let existingData = [];
    try {
        const existingWb = XLSX.readFile('weedmaps_total.xlsx');
        existingData = XLSX.utils.sheet_to_json(existingWb.Sheets[existingWb.SheetNames[0]]);
    } catch (err) {
        // File doesn't exist or cannot be read
        console.error("Error reading existing data:", err);
    }

    // Combine existing data with new data, excluding duplicates
    const combinedData = [...existingData, ...filteredData.filter(newEntry => !existingData.some(existingEntry => existingEntry.email === newEntry.email))];

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(combinedData);

    // Set the headers for the worksheet in camel-case
    XLSX.utils.sheet_add_aoa(ws, [
        ['id', 'name', 'city', 'state', 'email', 'phone_number', 'accepts_cc']
    ], { origin: 'A1' });

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write the workbook back to the file
    XLSX.writeFile(wb, 'weedmaps_total.xlsx');
})();
