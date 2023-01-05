import * as express from "express";
import {searchJobs} from "../models/job/job";
import {saveUserJob} from "../models/userJob/userJob";
import {findAll} from "../models/application/application";
import {mongoose} from "@typegoose/typegoose";


export const register = async (app: express.Application) => {
    // Home page
    app.get("/", (req: any, res) => {
        res.render("index");
    });

    // Jobs page, on first land, show all...
    app.get('/jobs', async (req, res) => {
        const [jobs, totalCount] = await searchJobs("", 0, false, false);
        res.render('jobs', {
            search: "", salaryMin: 0,
            appliedFilter: req.body.aopliedFiliter,
            unwantedFilter: req.body.unwantedFilter,
            jobs,
            totalCount
        });
    });

    // Search with posted details the jobs.
    app.post('/jobs', async (req, res) => {
        const [jobs, totalCount] = await searchJobs(req.body.search, req.body.salaryMin, req.body.appliedFilter,
            req.body.unwantedFilter);
        res.render('jobs', {
            search: req.body.search,
            salaryMin: req.body.salaryMin,
            appliedFilter: req.body.appliedFilter,
            unwantedFilter: req.body.unwantedFilter,
            jobs,
            totalCount
        });
    });

    // TODO register page
    // TODO login page
    // TODO search area.

    // app.get('/userJob', async (req, res) => {
    app.get('/userJob/:jobId/:status', async (req, res) => {
        // tslint:disable-next-line:no-console
        console.log("saving req.params = " + req.params.jobId)

        await saveUserJob(req.params.jobId, req.params.status)
        res.send(req.params)
    })

    // Application page listing.
    app.get('/applications', async (req, res) => {
        const userId = new mongoose.Types.ObjectId('1'.repeat(24));
        const [applications, totalCount] = await findAll(userId);
        res.render('applications', {applications, totalCount});
    })


    // About page
    app.get("/about", (req: any, res) => {
        res.render("about");
    });
};
