import * as express from "express";
import { searchJobs } from "../models/job/job";


/*
DONE TODOLIST:
    DONE - Add a basic search.
    DONE - implement mongoose, and typegoose to connect to local mongodb.

TODO
    Fill out Job Class.
    Fill out Company Class.
    Fill out User class.
    Start basic testing.
    How do we pass user id thru the site.
    Add an Indeed job scraper.
    Add a cron ability to run daily.
    Add paging on search results.
    Add userJobResponses to save user responding to a posting.
    Show Company list.
    Add Salary Ranges to Job object.
    Filter by Salaries.

    Ref populate references - how scalable are the underlying queries?
    https://stackoverflow.com/questions/64560563/typegoose-find-on-model-does-not-return-reference-array-fields
    Typegoose REF: https://typegoose.github.io/typegoose/docs/guides/quick-start-guide/
*/

export const register = async (app: express.Application) => {
    // Home page
    app.get("/", (req: any, res) => {
        res.render("index");
    });

    // Jobs page
    app.get('/jobs', async (req, res) => {
        const db = req.app.get('db');
        const jobs = await searchJobs(db, "");

        res.render('jobs', { jobs });
    });

    // Search with posted details the jobs.
    app.post('/jobs', async (req, res) => {
        // Call out to jobs service and get a list to display.
        const db = req.app.get('db');
        const jobs = await searchJobs(db, req.body.search);

        res.render('jobs', { jobs });
    });

    // TODO register page
    // TODO login page
    // TODO search area.

    // About page
    app.get("/about", (req: any, res) => {
        res.render("about");
    });
};
