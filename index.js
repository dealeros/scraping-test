const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require("fs");

const ObjectsToCsv = require("objects-to-csv");

const url = "https://example.com/";

const scrapeResults = [];
async function scrapeItems() {
    try {
        const htmlResult = await request.get(url); 
        const $ = await cheerio.load(htmlResult);

        $(".gallery-picture").each((index, element) => {
            const title = $(".title", element).text().trim();
            const dimension = $(".dimension", element).text();
            const price = $(".price", element).text();
            const productUrl = encodeURI(url + $(".title > a", element).attr('href'));
            const imageUrl = $(".image", element).attr('data-src');
            const scrapeResult = {productUrl, title, dimension, price, imageUrl};
            //if(index < 100)
            scrapeResults.push(scrapeResult);
        });
        return scrapeResults;

    } catch (err) {
        console.error(err);
    }
    
}

async function scrapeDesc(itemsList) {

    return await Promise.all(itemsList.map(async item => {
        await sleep(1000);
        try {
            const htmlResult = await request.get(item.productUrl);
            const $ = await cheerio.load(htmlResult);
            const productCode = [];
            const siblings = [];
            $(".product-info strong").each((index, element) => {
                productCode.push($(element).text());
            })
            item.productCode = productCode[0];
            $(".gallery-picture").each((index, element) => {
                const siblingDimension = $(".dimension", element).text();
                const siblingLink = url + $("a", element).attr('href');
                const siblingResult = {siblingDimension, siblingLink};
                siblings.push(siblingResult);
                

            })
            item.siblings = siblings;
            return item;
        } catch (err) {
            console.error(err);
        }
    }))

}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createCSV(data) {
    const csv = new ObjectsToCsv(data);
 
  // Save to file:
  await csv.toDisk('./test.csv');
}

async function main() {
    const itemsList = await scrapeItems();
    const fullData = await scrapeDesc(itemsList);
    fs.writeFileSync("./test.html", JSON.stringify(itemsList));
    console.log(fullData);
    await createCSV(fullData);
}
main();