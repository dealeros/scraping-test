//Instalation (npm and yarn)
//npm init --yes
//yarn add puppeteer cheerio
//create index.js
//-----------------
//mongoDb1user1
//wj0E8JsKB00CCreo

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Listing = require('./model/listing');

const months = {
    'sty': '1',
    'lut': '2',
    'mar': '3',
    'kwi': '4',
    'maj': '5',
    'cze': '6',
    'lip': '7',
    'sie': '8',
    'wrz': '9',
    'paź': '10',
    'lis': '11',
    'gru': '12'
}
const monthsFull = {
    'Styczeń': '1',
    'Luty': '2',
    'Marzec': '3',
    'Kwiecień': '4',
    'Maj': '5',
    'Czerwiec': '6',
    'Lipiec': '7',
    'Sierpień': '8',
    'Wrzesień': '9',
    'Październik': '10',
    'Listopad': '11',
    'Grudzień': '12'
}

async function connectMongoDb() {
    await mongoose.connect("mongodb+srv://mongoDb1user1:wj0E8JsKB00CCreo@mongodb1-fynjk.mongodb.net/test?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('MongoDb connected');
}

async function scrapeListings(page) {
    await page.goto('https://www.pracuj.pl/praca/front%20end%20developer;kw/bydgoszcz;wp');
    //Pobranie domeny http://example.com
    const pageURL = await page.evaluate(() => {
        return document.location.protocol + "//" + document.location.host;
    });
    const html = await page.content();
    const $ = cheerio.load(html);
    // $(".results__list-container .offer-details__title-link").each((index, element) => {
    //         console.log($(element).text());
    //         console.log(pageURL + $(element).attr("href"));
    // });
    const listings = $(".results__list-container .results__list-container-item").map((index, element) => {
        const title = $(element).find(".offer-details__title-link").text();
        const url = pageURL + $(element).find(".offer-details__title-link").attr("href");
        let date = $(element).find(".offer-actions__date").clone().children().remove().end().text();
        date = date.replace(/(\r\n|\n|\r)/gm, "");
        date = date.split(" ");
        date = new Date(date[2] + '-' + months[date[1]] + '-' + date[0]);
        const place = $(element).find(".offer-labels__item.offer-labels__item--location").text();
        return {
            title,
            url,
            date,
            place
        };
    }).get();
    return listings;
}

async function scrapeJobDesc(listings, page) {
    for (let i = 0; i < listings.length; i++) {
        await page.goto(listings[i].url);
        const html = await page.content();
        const $ = cheerio.load(html);
        const jobDesc = $('#offTable').text();
        let expDate = $('.OfferView1YEokC').text();
        expDate = expDate.split(" ");
        expDate = new Date(expDate[2] + '-' + monthsFull[expDate[1]] + '-' + expDate[0]);
        listings[i].jobDesc = jobDesc;
        listings[i].expDate = expDate;
        console.log(listings[i].expDate);
        const listingModel = new Listing(listings[i]);
        await listingModel.save();
        await sleep(1000);
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    await connectMongoDb();
    //headless: false - to show browser, if ommited its working without showing browser
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    const listings = await scrapeListings(page);
    const listingsJobDesc = await scrapeJobDesc(listings, page);
    console.log(listings);
}

main();