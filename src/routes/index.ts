import * as express from "express";
import { searchJobs } from "../models/job/job";


/*
DONE TODOLIST:
    DONE - Add a basic search.
    DONE - implement mongoose, and typegoose to connect to local mongodb.
    DONE - Use ObjectId types, and proper return types.
    DONE - Add an Indeed job list scraper.
    DONE - Add Salary Ranges to Job object.
    DONE - Fill out Job Class.

TODO
    Disable semicolons on the end.
    Disable console.log warning.
    Fill out Company Class.
    Fill out User class.
    Filter by Salaries.
    Add userJobResponses to save user responding to a posting.
    Filter on multiple job titles.
    Filter OUT multiple job keywords.
    Indeed Job Page scraper.
    Indeed Company Page scraper
    How do we pass user id thru the site.
    Start basic testing.
    Do login part.
    Add a cron ability to run daily.
    Add paging on search results.
    Show Company list.

    Ref populate references - how scalable are the underlying queries?
    https://stackoverflow.com/questions/64560563/typegoose-find-on-model-does-not-return-reference-array-fields
    Typegoose REF: https://typegoose.github.io/typegoose/docs/guides/quick-start-guide/

    REF: https://javascript.plainenglish.io/improving-mongoose-model-with-typescript-9a349f41c71

*/

export const register = async (app: express.Application) => {
    // Home page
    app.get("/", (req: any, res) => {
        res.render("index");
    });

    // Jobs page, on first land, show all...
    app.get('/jobs', async (req, res) => {
        const [jobs, totalCount] = await searchJobs( "");

        res.render('jobs', { search:"", jobs, totalCount });
    });

    // Search with posted details the jobs.
    app.post('/jobs', async (req, res) => {
        const [jobs, totalCount] = await searchJobs(req.body.search);
        res.render('jobs', { search:req.body.search, jobs, totalCount });
    });

    // TODO register page
    // TODO login page
    // TODO search area.

    // About page
    app.get("/about", (req: any, res) => {
        res.render("about");
    });
};
