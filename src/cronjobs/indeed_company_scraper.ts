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

    const url = 'https://www.indeed.com/jobs?q=Senior+Node+Developer+%24160%2C000&sc=0kf%3Aattr%28DSQF7%29jt%28fulltime%29%3B&vjk=52419135d72c995a';

    await scrapeIndeedCompanyPage(url)
}

async function scrapeIndeedCompanyPage(companyUrl: string) {
    // tslint:disable-next-line:no-console
    console.log("Indeed scrape starting... company url=", companyUrl)

    // Manually scrape instead and find our data points.

    // TODO Future versions cans scrape company pages as  needed.

    // tslint:disable-next-line:no-console
    console.log("completed scraping company page");
}


