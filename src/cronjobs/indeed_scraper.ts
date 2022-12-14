import * as puppeteer from "puppeteer";
import * as mongoose from 'mongoose'
import {Job} from "../models/job/job";


/***
 * Cronjob: Scrape a set of urls from indeed and save all as new jobs to our db.

 */

run()

async function run() {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/', {dbName: 'test'});

    // todo scrape sort by date each time
    // https://www.indeed.com/jobs?q=Senior+Developer+%24160%2C000+educational&l=&vjk=b8eb73c6b42d6ab7
    const url = 'https://www.indeed.com/jobs?q=Senior+Node+Developer+%24160%2C000&sc=0kf%3Aattr%28DSQF7%29jt%28fulltime%29%3B&vjk=52419135d72c995a';
    // const url = 'https://www.indeed.com/jobs?q=Senior+Typescript+Developer+%24160%2C000&sc=0kf%3Aattr%28DSQF7%29jt%28fulltime%29%3B&vjk=52419135d72c995a';

    scrapeIndeedPage(url)


    const testJobs = [
        {
            _id: new mongoose.Types.ObjectId(),
            company: 'Signify Technology',
            title: 'Senior Backend Node Developer',
            indeedJobKey: 'de7a731ad07bd43d'
        },
        {
            _id: new mongoose.Types.ObjectId(),
            company: 'Jibble Group',
            title: 'Senior Front-End Developer (Vue.js)',
            indeedJobKey: '90665501df03e943'
        },
        {
            _id: new mongoose.Types.ObjectId(),
            company: 'Kensho',
            title: 'Senior Front End Software Engineer',
            indeedJobKey: 'bfbb828c28af68bf'
        }
    ]

    // saveNewJobs(testJobs)
}

async function scrapeIndeedPage(indeedUrl: string) {
    // tslint:disable-next-line:no-console
    console.log("Booking scrape starting...")
    // const browser = await puppeteer.launch({headless: true});
    const browser = await puppeteer.launch({headless: false});
    // NOTE: May only work as headless false...
    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 926});
    await page.goto(indeedUrl);

    const data = await page.content()

    // Manually scrape instead and find our data points.

    // mosaic-provider-jobcards"]={
    const regex2 = /(mosaic-provider-jobcards\"\]=\{.*?\n)/gms;
    const matches2 = data.match(regex2); // ["are", "are"]
    const data2 = matches2[0]

    // then "results"
    const matches3 = data2.match(/("results".*)/);
    const data4 = matches3[0]


    // Loop over each item now....
    const rows = data4.split(/workplaceInsights/i);
    // tslint:disable-next-line:no-console
    // console.log('rows', rows)
    // tslint:disable-next-line:no-console
    console.log(rows.length)

    const jobs: any[] = []
    rows.forEach((row, index) => {
        // tslint:disable-next-line:no-console
        console.log("\n\n\nRow " + index + "= ", row)
        // Grab out each important field
        // "company": "Cygnet Global Resources",
        const matchCompany = row.match(/company":"(.*?)"/)
        const company = matchCompany?.[1]
        // tslint:disable-next-line:no-console
        console.log("matchCompany = ", matchCompany?.[1])

        const matchTitle = row.match(/title":"(.*?)"/)
        const title = matchTitle?.[1]
        const matchIndeedJobKey = row.match(/jobkey":"(.*?)"/)
        const indeedJobKey = matchIndeedJobKey?.[1]
        // TODO jobLocationCity
        // TODO SALARY
        // TODO Create links like this: https://www.indeed.com/viewjob?jk=2b019408a094f723&from=serp&vjs=3

        // Add an object to our array.
        if (indeedJobKey) {
            jobs.push({
                _id: new mongoose.Types.ObjectId(),
                title,
                indeedJobKey,
                company,
                link: "https://www.indeed.com/viewjob?jk="+indeedJobKey
            })
        }
    })

    // tslint:disable-next-line:no-console
    console.log("jobs list: ", jobs)
    await saveNewJobs(jobs)

    // tslint:disable-next-line:no-console
    console.log("completed scraping");
}


// todo move this to other areas later.
async function saveNewJobs(jobs: any[]) {
    // Step 1: Check list before inserting them for dupes.
    const indeedJobKeys = jobs.map((job) => job.indeedJobKey)
    // tslint:disable-next-line:no-console
    console.log('indeedJobKeys = ', indeedJobKeys)

    // Step 2: Call to query to find dupes.
    const knownJobs = await Job.find({indeedJobKey: {$in: indeedJobKeys}})
    // tslint:disable-next-line:no-console
    // console.log('knownJobs = ', knownJobs)
    const knownIndeedJobKeys = knownJobs.map((job) => job.indeedJobKey)
    // tslint:disable-next-line:no-console
    console.log('knownIndeedJobKeys = ', knownIndeedJobKeys)

    // Step 3:  Remove those from this list.
    const newJobs = jobs.filter((job) => !knownIndeedJobKeys.includes(job.indeedJobKey))
    // tslint:disable-next-line:no-console
    console.log('newJobs = ', newJobs)

    // Step 4: Add those new ones in now
    if (newJobs.length > 0) {
        // tslint:disable-next-line:no-console
        console.log('Inserting newJobs count = ', newJobs.length)
        await Job.insertMany(newJobs)

        // TODO add any new companies also.
        const companies = jobs.map((job) => job.company)
        // tslint:disable-next-line:no-console
        console.log('companies = ', companies)
    } else {
        // tslint:disable-next-line:no-console
        console.log("Inserting no new jobs, no new found.")
    }


}