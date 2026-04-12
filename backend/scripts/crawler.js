const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const baseURL = 'https://kmclu.ac.in/';
const visitedLinks = new Set();
let universityData = [];

async function crawl(url) {
    // 20 pages tak limit rakhte hain testing ke liye
    if (visitedLinks.has(url) || !url.startsWith(baseURL) || visitedLinks.size > 20) return;

    console.log(`🔍 Crawling: ${url}`);
    visitedLinks.add(url);

    try {
        const { data } = await axios.get(url, { timeout: 10000 });
        const $ = cheerio.load(data);

        // Content nikalna
        $('p, h1, h2, h3, li').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 40) { // Sirf meaningful lines
                universityData.push({ 
                    source: url, 
                    content: text 
                });
            }
        });

        // Agli links dhundna
        const links = [];
        $('a').each((i, el) => {
            const link = $(el).attr('href');
            if (link && !link.includes('#')) {
                try {
                    const fullURL = new URL(link, baseURL).href;
                    links.push(fullURL);
                } catch (e) { /* Invalid URL skip */ }
            }
        });

        for (const link of links) {
            await crawl(link);
        }

    } catch (error) {
        console.log(`❌ Failed ${url}: ${error.message}`);
    }
}

async function start() {
    console.log("🚀 Starting KMCLU Crawler...");
    await crawl(baseURL);
    
    // File save karna
    const outputPath = path.join(__dirname, 'university_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(universityData, null, 2));
    
    console.log(`\n✅ Done! Total entries: ${universityData.length}`);
    console.log(`📁 File saved at: ${outputPath}`);
}

start();