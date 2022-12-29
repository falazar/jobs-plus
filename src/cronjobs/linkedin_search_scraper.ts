import * as puppeteer from "puppeteer";
import * as mongoose from 'mongoose'
import {Job} from "../models/job/job";
import {saveNewCompanies} from "../models/company/company";


/***
 * Cronjob: Scrape a set of urls from LinkedIn and save all as new jobs to our db.

 From Command Line:
 node -e 'require("./build/cronjobs/linkedin_search_scraper").run()'
 */



export async function run() {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/', {dbName: 'test'});

    // todo scrape sort by date each time
    // Choose randomly from a list or urls for now.
    let urls = [
        // 'https://www.linkedin.com/jobs/search/?keywords=javascript&location=United%20States&refresh=true&sortBy=R&start=0&sortBy=DD',
        'https://www.linkedin.com/jobs/search/?f_JT=F&f_SB2=8&f_TPR=r604800&f_WT=2&geoId=103644278&keywords=javascript&location=United%20States&refresh=true&sortBy=DD',
    ]

    urls = urls
        .map(value => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => value)
    // tslint:disable-next-line:no-console
    console.log("urls", urls)

    await scrapeLinkedindPage(urls[0])

}

async function scrapeLinkedindPage(indeedUrl: string) {
    // tslint:disable-next-line:no-console
    console.log("Linkedin scrape starting... url=", indeedUrl)

    const pptr = require('puppeteer-core');
    // TODO Note: cant get it to use same session and be logged in as me.
    const browser = await pptr.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        // args: [
        //     '--user-data-dir=/Users/jamesratcliff/Library/Application Support/Google/Chrome/',
        //     // '--no-sandbox', '--disable-setuid-sandbox',
        // ],
    });


    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 926});
    await page.goto(indeedUrl);

    // TODO login instead test after page load.
    // await page.waitForSelector('#login_form')
    // await page.type('input#email', 'falazar@yahoo.com')
    // await page.type('input#pass', 'PASSWORD')
    // await page.click('#loginbutton')


    const data = await page.content()
    await page.screenshot({path: 'example.png'});

    // Manually scrape instead and find our data points.
    // tslint:disable-next-line:no-console
    // console.log('data', data)

    // TODO need to be logged in for proper all filters to work, remote etc.


    // Loop over each item now....
    const rows = data.split(/<div class="base-card relative/i);
    // console.log('row 0', rows[0])
    // tslint:disable-next-line:no-console
    console.log('rows', rows)
    // tslint:disable-next-line:no-console
    console.log(rows.length)
    const jobs: any[] = []
    rows.forEach((row: string, index: number) => {
        // tslint:disable-next-line:no-console
        // console.log("\n\n\nRow " + index + "= ", row)

        // Grab out each important field.
        const company = row.match(/job-search-card-subtitle">\n* *(.*?)\n* *</ims)?.[1]
        // tslint:disable-next-line:no-console
        console.log("company=" + company + "*")

        const title = row.match(/base-search-card__title">[ \n]*(.*?) *\n* *</ims)?.[1]
        // tslint:disable-next-line:no-console
        console.log("title=" + title + '*')
        // todo strip whitespaces

        // JOB URL HERE
        // https://www.linkedin.com/jobs/view/3411773676/?eBP=JOB_SEARCH_ORGANIC&recommendedFlavor=JOB_SEEKER_QUALIFIED&refId=iKwhTa4%2BR0lBoWHNuPW9mA%3D%3D&trackingId=fstO4jBJBmAiGrcDK64xsw%3D%3D&trk=flagship3_search_srp_jobs
        // https://www.linkedin.com/jobs/view/3411773676

        const matchJobKey = row.match(/jobPosting:(\d+)"/)
        const jobKey = matchJobKey?.[1]
        // tslint:disable-next-line:no-console
        console.log("jobKey = ", jobKey)

        // datetime="2022-12-17"
        const pubDate = row.match(/datetime="(.*?)"/)?.[1]
        //     const pubDate: number = Number(pubDateStr)
        // TODO CONVERT to proper date?
        // tslint:disable-next-line:no-console
        console.log("pubDate = ", pubDate)


        const location = row.match(/job-search-card__location">\n* *(.*?)\n* *</ims)?.[1]
        // tslint:disable-next-line:no-console
        console.log("location =" + location + "*")

        // Add an object to our array.
        if (jobKey) {
            const job = {
                _id: new mongoose.Types.ObjectId(),
                title,
                sourceSite: "linkedin",
                linkedinJobKey: jobKey,
                company,
                city: location,
                pubDate,
                link: "https://www.linkedin.com/jobs/view/" + jobKey,
            }
            jobs.push(job)
        }
    })

    // tslint:disable-next-line:no-console
    console.log("jobs list: ", jobs)
    await saveNewJobs(jobs)

    // tslint:disable-next-line:no-console
    console.log("completed scraping")
}


// todo move this to other areas later.
async function saveNewJobs(jobs: any[]) {
    // Step 1: Check list before inserting them for dupes.
    const jobKeys = jobs.map((job) => job.linkedinJobKey)

    // Step 2: Call to query to find dupes.
    const knownJobs = await Job.find({linkedinJobKey: {$in: jobKeys}})
    const knownJobKeys = knownJobs.map((job) => job.linkedinJobKey)

    // Step 3:  Remove those from this list.
    const newJobs = jobs.filter((job) => !knownJobKeys.includes(job.linkedinJobKey))
    // tslint:disable-next-line:no-console
    console.log('newJobs = ', newJobs)

    // Step 4: Add those new ones in now
    if (newJobs.length > 0) {
        // tslint:disable-next-line:no-console
        console.log('Inserting newJobs count = ', newJobs.length)
        await Job.insertMany(newJobs)

        // Add any new companies also.
        const companies = jobs.map((job) => job.company)
        await saveNewCompanies(companies)
    } else {
        // tslint:disable-next-line:no-console
        console.log("Inserting no new jobs, no new found.")
    }

}


