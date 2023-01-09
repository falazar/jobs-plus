import * as express from 'express'
import { searchJobs } from '../models/job/job'
import { saveUserJob } from '../models/userJob/userJob'
import { changeApplicationStatus } from '../models/application/application'
import { findAll } from '../models/application/application'
import { mongoose } from '@typegoose/typegoose'

export const register = async (app: express.Application) => {
    // Home page
    app.get('/', (req: any, res) => {
        res.render('index')
    })

    // Jobs page, on first land, show all...
    app.get('/jobs', async (req, res) => {
        const [jobs, totalCount] = await searchJobs('', 0, 0, 7, false, false)
        res.render('jobs', {
            search: '',
            salary: 0, // todo move these into page as defaults???
            salaryMin: 0,
            appliedFilter: req.body.aopliedFiliter,
            unwantedFilter: req.body.unwantedFilter,
            jobs,
            totalCount,
        })
    })

    // Search with posted details the jobs.
    // todo pass all variable instead of one?
    app.post('/jobs', async (req, res) => {
        const [jobs, totalCount] = await searchJobs(
            req.body.search,
            req.body.salary,
            req.body.salaryMin,
            req.body.daysRange,
            req.body.appliedFilter,
            req.body.unwantedFilter
        )
        res.render('jobs', {
            search: req.body.search,
            salary: req.body.salary,
            salaryMin: req.body.salaryMin,
            daysRange: req.body.daysRange,
            appliedFilter: req.body.appliedFilter,
            unwantedFilter: req.body.unwantedFilter,
            jobs,
            totalCount,
        })
    })

    // TODO register page
    // TODO login page
    // TODO search area.

    // app.get('/userJob', async (req, res) => {
    app.get('/userJob/:jobId/:status', async (req, res) => {
        // tslint:disable-next-line:no-console
        console.log('saving req.params = ' + req.params.jobId)

        await saveUserJob(req.params.jobId, req.params.status)
        res.send(req.params)
    })

    // Application page listing.
    app.get('/applications', async (req, res) => {
        const userId = new mongoose.Types.ObjectId('1'.repeat(24))
        const [applications, totalCount, avgSalaryMin, avgSalaryMax] = await findAll(userId, false, true, false, false)
        res.render('applications', {
            applications,
            totalCount,
            avgSalaryMin,
            avgSalaryMax,
            allStatusFilter: false,
            appliedStatusFilter: true,
            userDeclinedStatusFilter: false,
            companyDeclinedStatusFilter: false,
        })
    })

    app.post('/applications', async (req, res) => {
        const userId = new mongoose.Types.ObjectId('1'.repeat(24))
        const [applications, totalCount, avgSalaryMin, avgSalaryMax] = await findAll(
            userId,
            req.body.allStatusFilter,
            req.body.appliedStatusFilter,
            req.body.userDeclinedStatusFilter,
            req.body.companyDeclinedStatusFilter
        )
        res.render('applications', {
            applications,
            totalCount,
            avgSalaryMin,
            avgSalaryMax,
            allStatusFilter: req.body.allStatusFilter,
            appliedStatusFilter: req.body.appliedStatusFilter,
            userDeclinedStatusFilter: req.body.userDeclinedStatusFilter,
            companyDeclinedStatusFilter: req.body.companyDeclinedStatusFilter,
        })
    })

    app.get('/application/:applicationId/:status', async (req, res) => {
        // tslint:disable-next-line:no-console
        console.log('saving req.params jobId = ' + req.params.applicationId)
        console.log('saving req.params status = ' + req.params.status)

        await changeApplicationStatus(req.params.applicationId, req.params.status)
        res.send(req.params)
    })

    // About page
    app.get('/about', (req: any, res) => {
        res.render('about')
    })
}
