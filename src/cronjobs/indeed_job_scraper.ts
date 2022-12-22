import * as puppeteer from "puppeteer";
import * as mongoose from 'mongoose'
import {Job, JobClass} from "../models/job/job";
import {Company} from "../models/company/company";


/***
 * Cronjob: Scrape a set of job pages from indeed and save all as updated jobs to our db.

 From Command Line:
 node -e 'require("./build/cronjobs/indeed_job_scraper").run()'


 TODO scrape missing sections on thiis one
 https://www.indeed.com/viewjob?jk=8a4a0ecfa5034fb0
 https://www.indeed.com/viewjob?jk=71bb10fedfae3555
 */


export async function run() {
    // Connect to MongoDB - make optional???
    await mongoose.connect('mongodb://localhost:27017/', {dbName: 'test'})

    // Pull up the last 5-10 jobs that are not scraped yet and process them.
    const jobs: JobClass[] = await Job.find({
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
        await scrapeIndeedJobPage(job.indeedJobKey, index+1, browser)
    }

    // TEST ONE
    // const jobkey = "8a4a0ecfa5034fb0"
    // await scrapeIndeedJobPage(jobkey, 1, browser)

    // tslint:disable-next-line:no-console
    console.log("completed scraping all job pages");
}

// Given a job key and browser puppeteer, grab our data now.
async function scrapeIndeedJobPage(indeedJobKey: string, index: number, browser: puppeteer.Browser) {
    // Load job and url
    const job = await Job.findOne({indeedJobKey})
    // tslint:disable-next-line:no-console
    const jobUrl = job.link

    // tslint:disable-next-line:no-console
    console.log(index+ ". Indeed scrape starting... job url=", jobUrl)

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

    // Qualifications sometimes has.
    const regex2 = />(Qualifications<.*?)<h2/ms;
    const matches2 = data.match(regex2);
    const data3 = matches2?.[0]
    // tslint:disable-next-line:no-console
    // console.log('data3', data3)
    if (data3) {
        // Update job field here.
        job.qualifications = "<h2" + data3
    }


    await job.save()
}



