import * as puppeteer from "puppeteer";
import * as mongoose from 'mongoose'
import {Job, JobClass} from "../models/job/job";
import {saveNewCompanies} from "../models/company/company";


/***
 * Cronjob: Scrape a set of job pages from LinkedIn and save all as new jobs to our db.

 From Command Line:
 node -e 'require("./build/cronjobs/linkedin_job_scraper").run()'
 */


export async function run() {
    // Connect to MongoDB - make optional???
    await mongoose.connect('mongodb://localhost:27017/', {dbName: 'test'})

    // Pull up the last 5-10 jobs that are not scraped yet and process them.
    const jobs: JobClass[] = await Job.find({
        sourceSite: 'linkedin',
        description: null
    }).sort({createdAt: "desc"})
    // tslint:disable-next-line:no-console
    console.log('jobs count ', jobs.length)

    // const browser = await puppeteer.launch({headless: true});
    const browser = await puppeteer.launch({headless: false});
    // NOTE: May only work as headless false...

    for (const job of jobs) {
        const index = jobs.indexOf(job);
        if (index > 19) {
            continue;
        }
        await scrapeLinkedinJobPage(job.linkedinJobKey, index+1, browser)
    }

    // TEST ONE
    // const jobkey = "8a4a0ecfa5034fb0"
    // await scrapeLinkedinJobPage(jobkey, 1, browser)

    // tslint:disable-next-line:no-console
    console.log("completed scraping all job pages");
}

// Given a job key and browser puppeteer, grab our data now.
async function scrapeLinkedinJobPage(linkedinJobKey: string, index: number, browser: puppeteer.Browser) {
    // Load job and url.
    const job = await Job.findOne({ linkedinJobKey })
    const jobUrl = job.link

    // tslint:disable-next-line:no-console
    console.log(index+ ". Linkedin scrape starting... job url=", jobUrl)

    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 926});
    await page.goto(jobUrl);
    const data = await page.content()
    // tslint:disable-next-line:no-console
    // console.log('job page data=', data)


    // chop off bottom of page.   Similar jobs
    const data2 = data.split("Similar jobs")?.[0]
    // tslint:disable-next-line:no-console
    console.log('data2=', data2)

    // Full Job Description usually has:
    const regex1 = /class="description__text(.*?)<\/div/ims;
    const data3 = data2.match(regex1)?.[0]
    // tslint:disable-next-line:no-console
    console.log('data3', data3)
    // Update job field here.
    job.description = "<div " + data3

    // TODO Note: Salary is not broken out if not logged in properly, cant scrape all of them.
    // Salary: $180k-$200k
    // 3325860126
    //
    // $175,000 - $195,000 in listing.



    // tslint:disable-next-line:no-console
    console.log('job to save', job)

    await job.save()
}


