import * as puppeteer from "puppeteer";
import * as mongoose from 'mongoose'
import {Job, JobClass} from "../models/job/job";
import {Company} from "../models/company/company";


/***
 * Cronjob: Scrape a set of job pages from indeed and save all as updated jobs to our db.

 From Command Line:
 node -e 'require("./build/cronjobs/indeed_job_scraper").run()'


 TODO scrape missing sections on this one
 https://www.indeed.com/viewjob?jk=8a4a0ecfa5034fb0
 https://www.indeed.com/viewjob?jk=71bb10fedfae3555
 */


export async function run() {
    // Connect to MongoDB - make optional???
    await mongoose.connect('mongodb://localhost:27017/', {dbName: 'test'})

    // Pull up the last 5-10 jobs that are not scraped yet and process them.
    const jobs: JobClass[] = await Job.find({
        sourceSite: 'indeed',
        description: null
    }).sort({createdAt: "desc"})
    // tslint:disable-next-line:no-console
    console.log('indeed jobs count ', jobs.length)

    // const browser = await puppeteer.launch({headless: true});
    const browser = await puppeteer.launch({headless: false});
    // NOTE: May only work as headless false...

    // TEST ONE
    // const jobkey = "adb2786f6ca22013"
    // https://www.indeed.com/viewjob?jk=2033ce18816dbd61
    // await scrapeIndeedJobPage(jobkey, 1, browser)

    for (const job of jobs) {
        const index = jobs.indexOf(job);
        if (index > 19) {
            break;
        }
        await scrapeIndeedJobPage(job.indeedJobKey, index + 1, browser)
    }


    // tslint:disable-next-line:no-console
    console.log("completed scraping all indeed job pages");
}

// Given a job key and browser puppeteer, grab our data now.
async function scrapeIndeedJobPage(indeedJobKey: string, index: number, browser: puppeteer.Browser) {
    // Load job and url
    const job = await Job.findOne({indeedJobKey})
    // tslint:disable-next-line:no-console
    const jobUrl = job.link

    // tslint:disable-next-line:no-console
    console.log(index + ". Indeed scrape starting... job url=", jobUrl)

    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 926});
    await page.goto(jobUrl);
    const data = await page.content()

    // Full Job Description usually has.
    //     >Full Job Description<
    // const regex1 = />(Full Job Description<.*?)\/div>/ms;
    const regex1 = />(Full Job Description<.*?)<h2.*?>Hiring Insights/ims;
    const matches1 = data.match(regex1);
    const data2 = matches1?.[0]
    // tslint:disable-next-line:no-console
    // console.log('data2', data2)
    // Update job field here.
    job.description = "<h2" + data2

    // Get Estimated salary
    // $147K - $187K a year
    const regex2 = />\$(\d+)K - \$(\d+)K a year/ims;
    const matches2 = data.match(regex2);
    // Update job fields here.
    if (matches2) {
        // tslint:disable-next-line:no-console
        console.log('matches2=', matches2[1], matches2[2])

        job.salaryMin = parseInt(matches2[1], 10) * 1000
        job.salaryMax = parseInt(matches2[2], 10) * 1000
    }

    await job.save()
}



