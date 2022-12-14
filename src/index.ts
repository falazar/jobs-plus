import dotenv from "dotenv"
import express from "express"
import path from "path"
import * as routes from "./routes"
import * as mongoose from 'mongoose'

// TODO move these?
import * as cron from "node-cron"
import * as IndeedSearchScraper from "./cronjobs/indeed_search_scraper";
import * as IndeedJobScraper from "./cronjobs/indeed_job_scraper";
import * as IndeedCompanyScraper from "./cronjobs/indeed_company_scraper";


// TODO
// https://developer.okta.com/blog/2018/11/15/node-express-typescript  okta

dotenv.config()

// tslint:disable-next-line:no-console
run().catch(err => console.log(err))

async function run() {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/', {dbName: 'test'});
    // tslint:disable-next-line:no-console
    console.log("DB Connected");

    const port = process.env.SERVER_PORT;
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(express.static(path.join(__dirname, "public")));

    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");

    // Configure routes
    routes.register(app);

    // start the express server
    app.listen(port, () => {
        // tslint:disable-next-line:no-console
        console.log(`Server started at http://localhost:${port}`);
    });


    // Cron Jobs here.
    // Ref: https://reflectoring.io/schedule-cron-job-in-node/
    cron.schedule("0 15 * * * *", () => {
        // tslint:disable-next-line:no-console
        console.log(":15 Running IndeedSearchScraper...");
        IndeedSearchScraper.run()
    });

    cron.schedule("0 30 * * * *", () => {
        // tslint:disable-next-line:no-console
        console.log(":30 Running IndeedJobScraper...");
        IndeedJobScraper.run()
    });

    cron.schedule("0 45 * * * *", () => {
        // tslint:disable-next-line:no-console
        console.log(":45 Running IndeedCompanyScraper...");
        IndeedCompanyScraper.run()
    });


}

