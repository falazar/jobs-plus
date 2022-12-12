import * as express from "express";
import { searchJobs} from "../models/job/job";

/*
 TODO LIST:

    How do we pass user id thru the site.
    Add a search.
    Add a scraper.
    Add paging.
    Add userJobResponses.
    Show Company list.
    Add Salary Ranges.
    Filter by Salaries.
*/

export const register = (app: express.Application) => {
    // Home page
    app.get("/", (req: any, res) => {
        res.render("index");
    });

    // Jobs page
    app.get('/jobs', async (req, res) => {
        const jobs = await searchJobs("");
        // todo pass thru params
        const tagline = "No programming concept is complete without a cute animal mascot.";

        res.render('jobs', {
            jobs,
            tagline
        });
    });
    // Search with posted details the jobs.
    app.post('/jobs', async (req, res) => {
        // TODO make jobs searchable......(Hack fast version)

        const search = req.body.search;
        // tslint:disable-next-line:no-console
        console.log('req.body', req.body)
        // tslint:disable-next-line:no-console
        console.log('search', search)
        // Call out to jobs service and get a list to display.
        // const jobs = await loadUsersJobs('1234');
        // const jobs = await searchJobs('developer');
        const jobs = await searchJobs(search);
        // todo pass thru params
        const tagline = "No programming concept is complete without a cute animal mascot.";

        res.render('jobs', {
            jobs,
            tagline
        });
    });

    // TODO register page
    // TODO login page
    // TODO search area.

    // About page
    app.get("/about", (req: any, res) => {
        res.render("about");
    });
};
