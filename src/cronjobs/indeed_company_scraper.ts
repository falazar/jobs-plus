import * as puppeteer from "puppeteer";
import * as mongoose from 'mongoose'
import {Job} from "../models/job/job";
import {Company} from "../models/company/company";


/***
 * Cronjob: Scrape a set of company pages from indeed and save all as updated companies to our db.

 From Command Line:
     node -e 'require("./build/cronjobs/indeed_company_scraper").run()'

 */

export async function run() {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/', {dbName: 'test'});

    // todo scrape sort by date each time
    // https://www.indeed.com/jobs?q=Senior+Developer+%24160%2C000+educational&l=&vjk=b8eb73c6b42d6ab7
    const url = 'https://www.indeed.com/jobs?q=Senior+Node+Developer+%24160%2C000&sc=0kf%3Aattr%28DSQF7%29jt%28fulltime%29%3B&vjk=52419135d72c995a';
    // const url = 'https://www.indeed.com/jobs?q=Senior+Typescript+Developer+%24160%2C000&sc=0kf%3Aattr%28DSQF7%29jt%28fulltime%29%3B&vjk=52419135d72c995a';

    await scrapeIndeedCompanyPage(url)

    // process.exit()
}

async function scrapeIndeedCompanyPage(companyUrl: string) {
    // tslint:disable-next-line:no-console
    console.log("Indeed scrape starting... company url=", companyUrl)
    // const browser = await puppeteer.launch({headless: true});
    // const browser = await puppeteer.launch({headless: false});
    // // NOTE: May only work as headless false...
    // const page = await browser.newPage();
    // await page.setViewport({width: 1920, height: 926});
    // await page.goto(companyUrl);
    // const data = await page.content()

    // Manually scrape instead and find our data points.

    // mosaic-provider-jobcards"]={
    // const regex2 = /(mosaic-provider-jobcards\"\]=\{.*?\n)/gms;
    // const matches2 = data.match(regex2); // ["are", "are"]
    // const data2 = matches2[0]


    /*
        // Grab out each important field
        // "company": "Cygnet Global Resources",
        const company = row.match(/company":"(.*?)"/)?.[1]
        // tslint:disable-next-line:no-console
        console.log("company = ", company)

        const title = row.match(/title":"(.*?)"/)?.[1]
        const matchIndeedJobKey = row.match(/jobkey":"(.*?)"/)
        const indeedJobKey = matchIndeedJobKey?.[1]
        // Some cities missing...
        const city = row.match(/jobLocationCity":"(.*?)"/)?.[1]
        const pubDateStr = row.match(/pubDate":(\d+)/)?.[1]
        const pubDate: number = Number(pubDateStr)
        let pubDateString = null
        // TODO CONVERT PROPERLY
        if (pubDate) {
            // tslint:disable-next-line:no-console
            console.log("pubDate = ", pubDate)
            pubDateString = new Date(Number(pubDate) / 1000)
            // tslint:disable-next-line:no-console
            console.log("pubDateString = ", pubDateString)
        }


        // Add an object to our array.
        if (indeedJobKey) {
            const job = {
                _id: new mongoose.Types.ObjectId(),
                title,
                indeedJobKey,
                company,
                city,
                pubDate,
                link: "https://www.indeed.com/viewjob?jk=" + indeedJobKey,
                salaryMin,
                salaryMax,
            }
            jobs.push(job)
        }
     */

    // tslint:disable-next-line:no-console
    // console.log("jobs list: ", jobs)
    // await saveNewJobs(jobs)

    // TODO update company here.

    // tslint:disable-next-line:no-console
    console.log("completed scraping company page");
}


