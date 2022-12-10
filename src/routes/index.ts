import * as express from "express";
import {loadUsersJobs} from "../models/job/job";

/*
 TODO LIST:

    How do we pass user id thru the site.
    Add a search.
    Add a scraper.
    Add paging.
    Add juserJobResponses.
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
        // TODO make jobs searchable......(Hack fast version)
        // Call out to jobs service and get a list to display.
        const jobs = await loadUsersJobs('1234');
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
