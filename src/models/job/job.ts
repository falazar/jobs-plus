import * as mongoose from 'mongoose'
import {Company, loadCompanies} from "../company/company";
import {Model, model, Schema} from "mongoose";
import {getModelForClass, modelOptions, prop} from "@typegoose/typegoose";

@modelOptions({ options: { customName: 'job' } })
class JobClass {
    @prop()
    public title: string;

    @prop()
    public companyId: string;
}
export const Job = getModelForClass(JobClass);



// REF: https://javascript.plainenglish.io/improving-mongoose-model-with-typescript-9a349f41c71

// const JobSchema = new mongoose.Schema({ _id: 'string', title: 'string', company: 'string' });
// const JobSchema = new mongoose.Schema({_id: 'string', title: 'string', company: 'string'});
// const Job = model("job", JobSchema) // todo how do we use this one????
// const JobSchema: Schema<IJobDocument> = new Schema(
//     {_id: 'string', title: 'string', company: 'string'});
// JobSchema.statics.buildJob = (args: IJob) => {
//     return new Job(args)
// }

// const Job = model("job", JobSchema) // todo how do we use this one????
// const Job = model<IJobDocument, IJobModel>("job", JobSchema) // todo how do we use this one????

export default Job;

// Load all jobs now from db....
export async function loadUsersJobs(db: any) {
    const jobs:any = [];

    // // TODO Hard code sample set here.
    // const Job2 = db.model('job', JobSchema);
    // jobs.push(new Job2("1", "Junior Developer", "CyberCoders", 50000));
    // jobs.push(new Job2("2", "Middle Level Developer", "Lending Tree", 150000));
    // jobs.push(new Job2("3", "Senior Developer", "Indeed", 200000));
    // // tslint:disable-next-line:no-console
    // console.log('jobs')
    // // tslint:disable-next-line:no-console
    // console.log(jobs)

    return jobs;
}


// TEST USING TYPEGOOSE
// REF: https://www.sitepoint.com/javascript-typescript-orms/#mongoose
// class JobClass {
//     // @prop()
//     public title?: string
//     public company?: string
// }
//
// const Job3 = getModelForClass(JobClass);




// Search for any jobs to display for them.
export async function searchJobs(db: any, search: string): Promise<any[]> {
    // TODO 1. Filter all jobs by 2 weeks,
    const titleSearch = new RegExp(`.*${search}.*`, 'i');
    // tslint:disable-next-line:no-console
    console.log(titleSearch)

    const jobs = await Job.find({ title: titleSearch});
    // tslint:disable-next-line:no-console
    console.log(jobs)
    // tslint:disable-next-line:no-console
    console.log(typeof jobs)

    // then 2. If not enough, redo filter by 4 weeks.
    // then 3. Calc each score for job,
    // then 4. sort and return paged results
    // TODO 5. Load Companies associated and add to object.
    const companies = await loadCompanies(db);

    return jobs;
}


