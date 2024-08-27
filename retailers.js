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

    const uniqueEmails = new Set();
    const filteredData = [];

    const fetchData = async (url) => {
        const res = await fetch(url, {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "access-control-expose-headers": "Content-Disposition",
                "content-type": "application/json",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "Referer": "https://search.cannabis.ca.gov/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        });
        return await res.json();
    };

    const fetchDataAndProcess = async (url) => {
        const data = await fetchData(url);

        if (data && data.data && Array.isArray(data.data)) {
            data.data.forEach(listing => {
                // Check if the email is unique before adding it to the filteredData array
                if (!uniqueEmails.has(listing.businessEmail)) {
                    uniqueEmails.add(listing.businessEmail);
                    filteredData.push({
                        licenseStatus: listing.licenseStatus,
                        licenseType: listing.licenseType,
                        licenseDesignation: listing.licenseDesignation,
                        businessDBA: listing.businessDbaName,
                        businessLegalName: listing.businessLegalName,
                        businessOwnerName: listing.businessOwnerName,
                        phone: listing.businessPhone,
                        email: listing.businessEmail.toLowerCase(),
                        city: listing.premiseCity,
                        county: listing.premiseCounty
                        // Add more fields as needed
                    });
                }
            });
        } else {
            console.error("Invalid API response format or no listings found:", data);
        }
    };

    // Latitude and longitude boundaries for California
    const minLatitude = 32.5;
    const maxLatitude = 42.0;
    const minLongitude = -124.5;
    const maxLongitude = -114.1;

    let pageNumber = 1;
    let moreData = true;
    
    while (moreData) {
        const url = `https://as-dcc-pub-cann-w-p-002.azurewebsites.net/licenses/RetailerLocationSearch?minLatitude=${minLatitude}&maxLatitude=${maxLatitude}&minLongitude=${minLongitude}&maxLongitude=${maxLongitude}&pageSize=50&pageNumber=${pageNumber}`;
        const previousDataCount = filteredData.length;

        await fetchDataAndProcess(url);

        // If no new data was added, then no more pages
        moreData = filteredData.length > previousDataCount;
        pageNumber++;
    }

    // Read existing data from the file
    let existingData = [];
    try {
        const existingWb = XLSX.readFile('retailers.xlsx');
        existingData = XLSX.utils.sheet_to_json(existingWb.Sheets[existingWb.SheetNames[0]]);
    } catch (err) {
        // File doesn't exist or cannot be read
        console.error("Error reading existing data:", err);
    }

    // Combine existing data with new data, excluding duplicates
    const combinedData = [...existingData, ...filteredData.filter(newEntry => !existingData.some(existingEntry => existingEntry.email === newEntry.email))];

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(combinedData, {
        header: ['licenseStatus', 'licenseType', 'licenseDesignation', 'businessDBA', 'businessLegalName', 'businessOwnerName', 'phone', 'email', 'city', 'county'],
        skipHeader: false
    });

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write the workbook back to the file
    XLSX.writeFile(wb, 'retailers.xlsx');
})();
