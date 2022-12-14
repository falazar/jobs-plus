import * as mongoose from 'mongoose'
import {CompanyClass, loadCompanies} from "../company/company";
import {getModelForClass, modelOptions, prop} from "@typegoose/typegoose";
import {TimeStamps} from "@typegoose/typegoose/lib/defaultClasses";

@modelOptions({ options: { customName: 'job' } })
export class JobClass extends TimeStamps {
    _id: mongoose.Types.ObjectId

    @prop()
    public title: string

    @prop()
    public companyId?: mongoose.Types.ObjectId

    @prop()
    public indeedJobKey?: string

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
    public pubDate?: Date

    // @prop()
    // public createdAt?: Date

    // TEMP FIELDS FOR NOW
    @prop()
    public company?: string
}
export const Job = getModelForClass(JobClass)


// Search for any jobs to display for them.
export async function searchJobs(search: string): Promise<JobClass[]> {
    // TODO 1. Filter all jobs by 2 weeks,
    const titleSearch = new RegExp(`.*${search}.*`, 'i')
    // tslint:disable-next-line:no-console
    console.log(titleSearch)

    const jobs: JobClass[] = await Job.find({ title: titleSearch})
    // tslint:disable-next-line:no-console
    console.log(jobs)
    // tslint:disable-next-line:no-console
    console.log(typeof jobs)

    // TODO then 2. If not enough, redo filter by 4 weeks.
    // TODO then 3. Calc each score for job,
    // TODO then 4. sort and return paged results
    // TODO 5. Load Companies associated and add to object.
    const companies: CompanyClass[] = await loadCompanies();
    // tslint:disable-next-line:no-console
    console.log(companies)
    // tslint:disable-next-line:no-console
    console.log(typeof companies)
    // TODO cant return full company unless we do a reference or something??  hmmm just generic objects i guess.

    return jobs;
}


