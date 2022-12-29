import * as mongoose from 'mongoose'
import {CompanyClass, loadCompanies} from "../company/company";
import {getModelForClass, modelOptions, prop} from "@typegoose/typegoose";
import {TimeStamps} from "@typegoose/typegoose/lib/defaultClasses";
import {UserJobClass, UserJob} from "../userJob/userJob";

@modelOptions({options: {customName: 'job'}})
export class JobClass extends TimeStamps {
    _id: mongoose.Types.ObjectId

    @prop()
    public title: string

    @prop()
    public companyId?: mongoose.Types.ObjectId

    @prop()
    public sourceSite?: string
    @prop()
    public indeedJobKey?: string
    @prop()
    public linkedinJobKey?: string
    @prop()
    public link?: string
    @prop()
    public city?: string
    // TODO state?

    @prop()
    public salaryMin?: number
    @prop()
    public salaryMax?: number
    @prop()
    public description?: string
    @prop()
    public qualifications?: string
    @prop()
    public pubDate?: Date

    // TEMP FIELDS FOR NOW
    @prop()
    public company?: string

    // Extended fields here for display:
    userJobStatus?: string
    companySector?: string;
}

export const Job = getModelForClass(JobClass)


// Search for any jobs to display for them.
// export async function searchJobs(search: string): Promise<JobClass[], number> {
export async function searchJobs(search: string): Promise<[JobClass[], number]> {
    // STEP 1. Filter all jobs by 2 weeks,
    const titleSearch = new RegExp(`.*${search}.*`, 'i')
    // tslint:disable-next-line:no-console
    // console.log('titleSearch: ', JSON.stringify(titleSearch))

    const filters = {
        $and: [
            {title: titleSearch},
            {
                title:
                    {$not: {$regex: /(android|ios|front|golang|ruby|Ruby|.net|drupal)/i}}
            }
        ]
    }


    // tslint:disable-next-line:no-console
    console.log('filters: ', JSON.stringify(filters))

    let jobs: JobClass[] = await Job.find(filters)
        .sort({createdAt: -1})
        .limit(30)
    const totalCount: number = await Job.count(filters)

    // TODO Filter out userJobStatus ones we dont need to see.
    // STEP 2X. Join up with userJob to get status if available.
    jobs = await addUserJobStatus(jobs)
    // STEP 2. Load Companies associated and add to object.
    jobs = await addCompanySector(jobs)


// tslint:disable-next-line:no-console
    console.log('jobs: ', jobs.map((job) => job.title))

// TODO STEP 3. If not enough, redo filter by 4 weeks.

// TODO STEP 4. Calc each score for job.

// TODO STEP 5. Sort and return paged results.


    return [jobs, totalCount];
}

// Add status and filter out if not wanted.
export async function addUserJobStatus(jobs: JobClass[]) {
    const jobIds = jobs.map((job) => job._id)
    const userId = new mongoose.Types.ObjectId('1'.repeat(24))  // hard coded for testing.
    const userJobs: UserJobClass[] = await UserJob.find({jobId: {$in: jobIds}, userId})

    // Loop over each job and add user status.
    jobs.forEach((job, index) => {
        job.userJobStatus = userJobs.find((userJob) => userJob.jobId.toString() === job._id.toString())?.status
    })

    // Remove already unwanted jobs.
    jobs = jobs.filter((job) => job.userJobStatus !== 'unwanted')

    return jobs
}


export async function addCompanySector(jobs: JobClass[]) {
    const companyNames: string[] = jobs.map((job) => job.company)
    const companies: CompanyClass[] = await loadCompanies(Array.from(new Set(companyNames)));

    // Loop over each job and add companies on.
    jobs.forEach((job, index) => {
        job.companySector = companies.find((company) => company.name === job.company).sector
    })

    return jobs
}


