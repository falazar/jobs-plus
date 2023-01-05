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
// Search defaults to 25 results per page.
export async function searchJobs(search: string, salaryMin: number, appliedFilter: boolean, unwantedFilter: boolean): Promise<[JobClass[], number]> {
    // STEP 1. Filter all jobs by 2 weeks,
    const searchRegex = new RegExp(`.*${search}.*`, 'i')

    // todo pull out nots in titles.
    const notInTitles = new Set(["android", "ios", "front", "golang", "ruby", "\.net", "drupal", "president", "vp"])

    const notTitleWords = Array.from(notInTitles).join("|")
    const notRegex = new RegExp(`(${notTitleWords})`, 'i')
    // NOTE: Will match partial words here.
    // tslint:disable-next-line:no-console
    console.log('notRegex:', notRegex)
    const filters = {
        $and: [
            {
                $or:
                    [
                        {title: searchRegex},
                        {description: searchRegex},
                    ]
            },
            {
                title: {$not: notRegex}
            },
            {
                salaryMin: {$gte: salaryMin}
            }
        ]
    }
    // tslint:disable-next-line:no-console
    console.log('filters: ', JSON.stringify(filters))

    let jobs: JobClass[] = await Job.find(filters)
        .sort({createdAt: -1})
        .limit(30)
    const totalCount: number = await Job.count(filters)

    // STEP 2. Join up with userJob to get status if available.
    // and filter out userJobStatus ones we dont need to see.
    jobs = await addUserJobStatus(jobs, appliedFilter, unwantedFilter)
    // STEP 3. Load Companies associated and add to object.
    jobs = await addCompanySector(jobs)


    // tslint:disable-next-line:no-console
    // console.log('jobs: ', jobs.map((job) => job.title))

    // STEP 4: If not enough, redo filter by 4 weeks.
    if (jobs.length < 25) {
        // tslint:disable-next-line:no-console
        console.log('Redoing query to get more jobs, we had count='+jobs.length)
        // TODO MAKE METHOD.
        jobs = await Job.find(filters)
            .sort({createdAt: -1})
            .limit(90)

        // STEP 2. Join up with userJob to get status if available.
        // and filter out userJobStatus ones we dont need to see.
        jobs = await addUserJobStatus(jobs, appliedFilter, unwantedFilter)
        // STEP 3. Load Companies associated and add to object.
        jobs = await addCompanySector(jobs)

        // tslint:disable-next-line:no-console
        console.log('new count='+jobs.length)
    }

    // TODO STEP 5: Calc each score for job.

    // TODO STEP 6: Sort and return paged results.


    // Return only 25 results.
    return [jobs.slice(0, 25), totalCount];
}

// Add status and filter out if not wanted.
export async function addUserJobStatus(jobs: JobClass[], appliedFilter: boolean, unwantedFilter: boolean) {
    const jobIds = jobs.map((job) => job._id)
    const userId = new mongoose.Types.ObjectId('1'.repeat(24))  // hard coded for testing.
    const userJobs: UserJobClass[] = await UserJob.find({jobId: {$in: jobIds}, userId})

    // Loop over each job and add user status.
    jobs.forEach((job, index) => {
        job.userJobStatus = userJobs.find((userJob) => userJob.jobId.toString() === job._id.toString())?.status
    })

    if (!appliedFilter) {
        // Remove already applied to jobs.
        jobs = jobs.filter((job) => job.userJobStatus !== 'applied')
    }
    if (!unwantedFilter) {
        // Remove already unwanted jobs.
        jobs = jobs.filter((job) => job.userJobStatus !== 'unwanted')
    }

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


