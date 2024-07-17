(async function () {

    let fetch;
    try {
        const fetchModule = await import('node-fetch');
        const XLSXModule = await import('xlsx');
        fetch = fetchModule.default;
        XLSX = XLSXModule.default;
    } catch (err) {
        fetch = require('node-fetch');
        XLSX = require('XLSX');
    }
    
    const res = await fetch("https://api-g.weedmaps.com/discovery/v2/listings?page=1&page_size=100&sort_by=position_distance&filter%5Bany_retailer_services%5D%5B%5D=storefront&filter%5Bbounding_box%5D=38.76376551813092%2C-112.78564453125001%2C40.590014246054274%2C-96.96533203125001", {
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
    const data = await res.json();

    // Extract the data you want to write to Excel
    const excludedEmail = 'tom@slocalroots.store'; // Define the email address to exclude
    const filteredData = [];
    const uniqueEmails = new Set();
    data.data.listings.forEach(listing => {
        // Check if the email is unique before adding it to the filteredData array
        if (listing.email !== excludedEmail && !uniqueEmails.has(listing.email) ) {
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

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredData);
    
    // Set the headers for the worksheet
    ws['A1'] = { v: 'ID', t: 's' };
    ws['B1'] = { v: 'Name', t: 's' };
    ws['C1'] = { v: 'City', t: 's' };
    ws['D1'] = { v: 'State', t: 's' };
    ws['E1'] = { v: 'Email', t: 's' };
    ws['F1'] = { v: 'Phone Number', t: 's' };
    ws['G1'] = { v: 'Accepts Credit Cards', t: 's' };
    // Add more headers as needed
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Write the workbook to a file
    XLSX.writeFile(wb, 'output.xlsx');
})();
