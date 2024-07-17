const puppeteer = require('puppeteer');
const fs = require('fs');
const xlsx = require('xlsx');
const { setTimeout } = require('timers/promises');

async function scrapeBusinessDetails() {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({ headless: true }); // Launch in non-headless mode
        console.log('Browser launched successfully.');

        console.log('Opening new page...');
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 }); // Set a suitable viewport size
        console.log('New page opened successfully.');

        // Navigate to Google Maps
        console.log('Navigating to Google Maps...');
        await page.goto('https://www.google.com/maps');
        console.log('Google Maps loaded successfully.');

        // Search for vape stores near Los Angeles
        console.log('Searching for cbd stores...');
        await page.waitForSelector('input#searchboxinput');
        console.log('Search input found.');
        await page.type('input#searchboxinput', 'CBD Illinois store');
        console.log('Search query entered.');
        await page.click('button#searchbox-searchbutton');
        console.log('Search performed successfully.');

        // Wait for the search results to load
        console.log('Waiting for search results to load...');
        await page.waitForSelector('.m6QErb.DxyBCb.kA9KIf.dS8AEf.ecceSd');
        console.log('Search results loaded successfully.');

        const targetResults = 500; // Number of results you want to scrape
        let loadedResults = await getLoadedResultsCount(page);
        console.log(`Loaded ${loadedResults} results. Total loaded: ${loadedResults}`);

        // Scroll down to load more results
        while (loadedResults < targetResults) {
            await page.waitForSelector('.m6QErb.DxyBCb.kA9KIf.dS8AEf.ecceSd', { visible: true, clickable: true });
            await scrollToBottom(page);
            await setTimeout(2000); // Wait for additional results to load

            const newLoadedResults = await getLoadedResultsCount(page);
            if (newLoadedResults === loadedResults || newLoadedResults === targetResults) {
                console.log('No more results to load or target results reached.');
                break;
            }

            loadedResults = newLoadedResults;
            console.log(`Loaded ${loadedResults} results. Total loaded: ${loadedResults}`);
        }

        // Extract business details from the loaded results
        const googleMapLinks = await extractGoogleMapLinks(page);
        console.log('Scraped Google Map links: ', googleMapLinks);

        // Array to store scraped business websites
        const businessWebsites = [];
        // Set to store unique scraped emails
        const uniqueEmails = new Set();

        // Visit each Google Maps link and scrape business websites
        for (const link of googleMapLinks) {
            try {
                const pageWithWebsite = await browser.newPage();
                await pageWithWebsite.goto(link);

                // Wait for the "Website" button to appear
                await pageWithWebsite.waitForSelector('a[data-item-id="authority"]', { timeout: 1000 });

                // Extract the business website URL
                const websiteUrl = await pageWithWebsite.evaluate(() => {
                    const websiteElement = document.querySelector('a[data-item-id="authority"]');
                    return websiteElement ? websiteElement.href : null;
                });

                if (websiteUrl) {
                    businessWebsites.push(websiteUrl);
                    console.log('Scraped business website:', websiteUrl);
                } else {
                    console.log('No business website found for:', link);
                }

                await pageWithWebsite.close();
            } catch (e) {
                console.log('Error scraping business website:', e);
            }
        }
        console.log('Scraped business websites:', businessWebsites);

        // Visit each business website and scrape emails
        for (const website of businessWebsites) {
            try {
                const pageWithWebsite = await browser.newPage();
                await pageWithWebsite.goto(website);

                // Check if there's a contact or contact us page
                const contactLinks = await pageWithWebsite.$$eval('a', links => {
                    return links.filter(link => {
                        const linkText = link.textContent.toLowerCase();
                        console.log(linkText);
                        return linkText.includes('contact us') || linkText.includes('contact');
                    }).map(link => link.href);
                });

                if (contactLinks.length > 0) {
                    // Visit the contact page and scrape emails
                    await pageWithWebsite.goto(contactLinks[0]);
                    const emailsOnContactPage = await scrapeEmails(pageWithWebsite);
                    // Add unique emails to the set
                    emailsOnContactPage.forEach(email => uniqueEmails.add(email.toLowerCase()));
                    console.log(`Scraped emails from contact page ${website}: ${emailsOnContactPage}`);
                } else {
                    console.log('No contact or contact us page found on:', website);
                }

                await pageWithWebsite.close();
            } catch (e) {
                console.log('Error scraping business website:', e);
            }
        }
        // Convert set to array before writing to Excel
        const emails = Array.from(uniqueEmails);
        console.log('Scraped emails:', emails);

        // Write emails to an Excel file
        writeEmailsToExcel(emails, 'emails.xlsx');
        
        await browser.close();
    } 
    catch (error) {
        console.error('Error occurred:', error);
    }
}

async function extractBusinessWebsite(page) {
    return await page.evaluate(() => {
        const websiteElement = document.querySelector('[data-item-id="authority"] [jsaction="pane.rating.viewWebsite"]');
        return websiteElement ? websiteElement.href : null;
    });
}

async function getLoadedResultsCount(page) {
    return await page.evaluate(() => {
        return document.querySelectorAll('.Nv2PK.THOPZb.CpccDe').length;
    });
}

async function scrollToBottom(page) {
    // CSS selector for the search results container element
    const selector = '#QA0Szd > div > div > div.w6VYqd > div:nth-child(2) > div > div.e07Vkf.kA9KIf > div > div > div.m6QErb.DxyBCb.kA9KIf.dS8AEf.ecceSd > div.m6QErb.DxyBCb.kA9KIf.dS8AEf.ecceSd';

    // Get the search results container element
    const containerElement = await page.$(selector);

    // Check if the container element is found
    if (containerElement) {
        // Get the scrollHeight of the container element
        const containerHeight = await page.evaluate((element) => element.scrollHeight, containerElement);

        // Get the viewport height of the browser window
        const viewportHeight = await page.evaluate(() => window.innerHeight);

        // Initialize the scroll position to 0
        let scrollPosition = 0;

        // Calculate the maximum scroll position by subtracting the viewport height from the container height
        const maxScrollPosition = containerHeight - viewportHeight;

        // Loop until the scroll position reaches the maximum scroll position
        while (scrollPosition < maxScrollPosition) {
            // Increment the scroll position by 95% of the viewport height for faster scrolling
            scrollPosition += viewportHeight * 0.95;

            // Scroll the container element to the new scroll position
            await containerElement.evaluate((element, scrollPosition) => {
                element.scrollTo(0, scrollPosition);
            }, scrollPosition);

            console.log(`Scrolled to position: ${scrollPosition}`);

            // Wait for a shorter duration between each scroll (adjust the delay as needed)
            await setTimeout(500); // Reduce the delay to 500 milliseconds
        }
    } else {
        // Log an error if the search results container element is not found
        console.error('Unable to find the search results container element.');
    }
}


async function extractGoogleMapLinks(page) {
    return await page.evaluate(() => {
        const businessElements = document.querySelectorAll('.Nv2PK.THOPZb.CpccDe');

        const googleMapLinks = [];

        businessElements.forEach(element => {
            const link = element.querySelector('a').getAttribute('href');
            if (link.startsWith('https://www.google.com/maps')) {
                googleMapLinks.push(link);
            }
        });

        return googleMapLinks;
    });
}

async function scrapeEmails(page) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    // Extract text content of the entire page
    const textContent = await page.evaluate(() => document.body.innerText);

    // Extract emails using the email regex
    const extractedEmails = textContent.match(emailRegex) || [];

    return extractedEmails;
}

function writeEmailsToExcel(emails, filename) {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(emails.map(email => [email]));
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Emails');
    xlsx.writeFile(workbook, filename);
    console.log(`Emails written to ${filename}`);
}

scrapeBusinessDetails();
