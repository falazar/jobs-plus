import * as puppeteer from 'puppeteer'
import * as mongoose from 'mongoose'
import { Job, JobClass } from '../models/job/job'

/***
 * Cronjob: Scrape a set of job pages from LinkedIn and save all as new jobs to our db.

 From Command Line:
 node -e 'require("./build/cronjobs/linkedin_job_scraper").run()'
 */

export async function run() {
    // Connect to MongoDB - make optional???
    await mongoose.connect('mongodb://localhost:27017/', { dbName: 'test' })

    // Pull up the last 5-10 jobs that are not scraped yet and process them.
    const jobs: JobClass[] = await Job.find({
        sourceSite: 'linkedin',
        description: null,
    }).sort({ createdAt: 'desc' })
    // tslint:disable-next-line:no-console
    console.log('linkedin jobs count ', jobs.length)

    // TEST ONE
    // const jobkey = "3363523919"
    // await scrapeLinkedinJobPage(jobkey, 1, browser)

    for (const job of jobs) {
        const index = jobs.indexOf(job)
        if (index > 6) {
            break
        }
        try {
            await scrapeLinkedinJobPage(job.linkedinJobKey, index + 1)
        } catch (error) {
            // noop
            // throws an error after 3 loads.
            // tslint:disable-next-line:no-console
            console.log('linkedin error', error)
        }
    }

    // tslint:disable-next-line:no-console
    console.log('Completed scraping all linkedin job pages')
}

// Given a job key and browser puppeteer, grab our data now.
async function scrapeLinkedinJobPage(linkedinJobKey: string, index: number) {
    // Load job and url.
    const job = await Job.findOne({ linkedinJobKey })
    const jobUrl = job.link

    // tslint:disable-next-line:no-console
    console.log(index + '. Linkedin scrape starting... job url=', jobUrl)

    // const browser = await puppeteer.launch({headless: true});
    const browser = await puppeteer.launch({
        headless: true, // no popup to test with.
        args: ['--single-process', '--no-zygote', '--no-sandbox'],
    })
    // NOTE: May only work as headless false...
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 926 })

    await page.goto(jobUrl)
    // await page.waitForTimeout(4000)
    const data = await page.content()
    // tslint:disable-next-line:no-console
    // console.log('job page data=', data)

    // chop off bottom of page.   Similar jobs
    const data2 = data.split('Similar jobs')?.[0]
    // tslint:disable-next-line:no-console
    // console.log('data2=', data2)

    // Full Job Description usually has:
    const regex1 = /class="description__text(.*?)<\/div/ims
    const data3 = data2.match(regex1)?.[0]
    // tslint:disable-next-line:no-console
    // console.log('data3', data3)
    // Update job field here.
    job.description = '<div ' + data3

    // Note: Salary is not broken out if not logged in properly, cant scrape all of them.
    // Salary: $180k-$200k
    const regex2 = /\$(\d+)(,000|k) *. *\$(\d+)(,000|k)/i
    const matches2 = data.match(regex2)
    // Update job fields here.
    if (matches2) {
        // tslint:disable-next-line:no-console
        console.log('salary matches2=', matches2[1], matches2[3])

        job.salaryMin = parseInt(matches2[1], 10) * 1000
        job.salaryMax = parseInt(matches2[3], 10) * 1000
    }

    // tslint:disable-next-line:no-console
    // console.log('job to save', job)

    await job.save()
}
