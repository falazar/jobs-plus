import * as express from "express";
import { searchJobs } from "../models/job/job";
import { saveUserJob } from "../models/userJob/userJob";


/*
REF: https://www.indeed.com/advanced_search
// https://www.indeed.com/jobs?as_and=senior+software+educational&as_phr=&as_any=&as_not=&as_ttl=senior&as_cmp=&jt=fulltime&st=&salary=160000&radius=100&l=Austin&fromage=any&limit=50&sort=&psf=advsrch&from=advancedsearch&vjk=e458ca6335b2b4e9
// 50 results per page, can scrape super fast.

DONE TODOLIST:
    DONE - Add a basic search.
    DONE - implement mongoose, and typegoose to connect to local mongodb.
    DONE - Use ObjectId types, and proper return types.
    DONE - Add an Indeed job list scraper.
    DONE - Add Salary Ranges to Job object.
    DONE - Fill out Job Class.
    DONE - Add a cron ability to run daily.
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

    // app.get('/userJob', async (req, res) => {
    app.get('/userJob/:jobId/:status', async (req, res) => {
        // tslint:disable-next-line:no-console
        console.log("saving req.params = "+req.params.jobId)

        await saveUserJob(req.params.jobId, req.params.status)

        // app.get('/users/:userId/books/:bookId', (req, res) => {
            res.send(req.params)
        // })

        // test
        // res.render('about' )
    });


    // About page
    app.get("/about", (req: any, res) => {
        res.render("about");
    });
};
