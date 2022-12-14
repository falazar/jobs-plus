import * as puppeteer from "puppeteer";
import * as mongoose from 'mongoose'
import {Job} from "../models/job/job";
import {Company} from "../models/company/company";


/***
 * Cronjob: Scrape a set of urls from indeed and save all as new jobs to our db.

 */

// run().then()
run().then()


async function run() {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/', {dbName: 'test'});

    // todo scrape sort by date each time
    // https://www.indeed.com/jobs?q=Senior+Developer+%24160%2C000+educational&l=&vjk=b8eb73c6b42d6ab7
    const url = 'https://www.indeed.com/jobs?q=Senior+Node+Developer+%24160%2C000&sc=0kf%3Aattr%28DSQF7%29jt%28fulltime%29%3B&vjk=52419135d72c995a';
    // const url = 'https://www.indeed.com/jobs?q=Senior+Typescript+Developer+%24160%2C000&sc=0kf%3Aattr%28DSQF7%29jt%28fulltime%29%3B&vjk=52419135d72c995a';

    await scrapeIndeedPage(url)


    // TEST INSERT
    // const testJobs = [
    //     {
    //         _id: new mongoose.Types.ObjectId(),
    //         company: 'Signify Technology',
    //         title: 'Senior Backend Node Developer',
    //         indeedJobKey: 'de7a731ad07bd43d'
    //     },
    //     {
    //         _id: new mongoose.Types.ObjectId(),
    //         company: 'Jibble Group',
    //         title: 'Senior Front-End Developer (Vue.js)',
    //         indeedJobKey: '90665501df03e943'
    //     },
    //     {
    //         _id: new mongoose.Types.ObjectId(),
    //         company: 'Kensho',
    //         title: 'Senior Front End Software Engineer',
    //         indeedJobKey: 'bfbb828c28af68bf'
    //     }
    // ]
    // await saveNewJobs(testJobs)
    process.exit() // todo move up???
}

async function scrapeIndeedPage(indeedUrl: string) {
    // tslint:disable-next-line:no-console
    console.log("Indeed scrape starting... url=", indeedUrl)
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

        let salaryMin: number = null
        let salaryMax: number = null
        let salaryPeriod = null
        const matchSalary = row.match(/salarySnippet":(.*?)}/)
        // tslint:disable-next-line:no-console
        // console.log("matchSalary = ", matchSalary)
        const salarySnippet = matchSalary?.[1]
        // tslint:disable-next-line:no-console
        console.log("salarySnippet = ", salarySnippet)
        if (salarySnippet) {
            // "text": "$70 - $100 an hour"
            // "text": "$150,000 - $170,000 a year"
            // "text":"$227,000 a year"
            const matchSalaryText = salarySnippet.match(/text":"(.*?)"/)
            let salaryText = matchSalaryText?.[1]
            if (salaryText) {
                salaryText = salaryText.replace(/,/g, "") // remove all commas.
                // tslint:disable-next-line:no-console
                console.log("salaryText = ", salaryText)
                const matchSalaryRange = salaryText.match(/\$(\d+) - \$(\d+) (.*)/)
                // tslint:disable-next-line:no-console
                console.log("matchSalaryRange = ", matchSalaryRange)
                salaryMin = Number(matchSalaryRange?.[1])
                salaryMax = Number(matchSalaryRange?.[2])
                salaryPeriod = matchSalaryRange?.[3]
                if (salaryPeriod === "an hour") {
                    salaryMin = salaryMin * 40 * 52
                    salaryMax = salaryMax * 40 * 52
                }
                // tslint:disable-next-line:no-console
                console.log("salary = ", salaryMin, salaryMax)
                if (isNaN(salaryMin)) {
                    salaryMin = null
                }
                if (isNaN(salaryMax)) {
                    salaryMax = null
                }
            }
        }

        // Note:  Create links like this: https://www.indeed.com/viewjob?jk=2b019408a094f723&from=serp&vjs=3

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

    // Step 2: Call to query to find dupes.
    const knownJobs = await Job.find({indeedJobKey: {$in: indeedJobKeys}})
    const knownIndeedJobKeys = knownJobs.map((job) => job.indeedJobKey)

    // Step 3:  Remove those from this list.
    const newJobs = jobs.filter((job) => !knownIndeedJobKeys.includes(job.indeedJobKey))
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

// todo move this to other areas later.
// Given a string list of companies, add them now to the db if they are new.
async function saveNewCompanies(companyNames: string[]) {
    // tslint:disable-next-line:no-console
    console.log("Saving new companies now...")

    const companies: any[] = []
    companyNames.forEach((company) => {
        companies.push({ _id: new mongoose.Types.ObjectId(),
            name: company })
    })

    // Step 2: Call to query to find dupes.
    const knownCompanies = await Company.find({ name: { $in: companyNames } })
    const knownCompanyNames = knownCompanies.map((company) => company.name)

    // Step 3:  Remove those from this list.
    const newCompanies = companies.filter((company) => !knownCompanyNames.includes(company.name))
    // tslint:disable-next-line:no-console
    console.log('newCompanies = ', newCompanies)

    // Step 4: Add those new ones in now
    if (newCompanies.length > 0) {
        // tslint:disable-next-line:no-console
        console.log('Inserting newCompanies count = ', newCompanies.length)
        await Company.insertMany(newCompanies)
    } else {
        // tslint:disable-next-line:no-console
        console.log("Inserting no new companies, no new found.")
    }

}