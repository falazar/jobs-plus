import {getModelForClass, modelOptions, prop} from "@typegoose/typegoose";
import * as mongoose from "mongoose";
import {TimeStamps} from "@typegoose/typegoose/lib/defaultClasses";
import {Job, JobClass} from "../job/job";

@modelOptions({options: {customName: 'application'}})
export class ApplicationClass extends TimeStamps {
    _id: mongoose.Types.ObjectId

    @prop()
    public userId: mongoose.Types.ObjectId

    @prop()
    public jobId: mongoose.Types.ObjectId

    @prop()
    public status: string

    @prop()
    public applicationDate: Date

    // Extra objects.
    // @prop()
    public job?: JobClass
    // public jobObject?: JobClass

    // set of fields related to a user applying to a job.
    // including contact people and emails.
    // and list of events related to this application - such as interview
    // and current status.
    // possible link to emails from this company.

}

export const Application = getModelForClass(ApplicationClass);


// TODO ability to save and update an application


export async function findAll(userId: mongoose.Types.ObjectId): Promise<[ApplicationClass[], number]> {
    const filters = {
        // status: "applied"
        // Any status not rejected, stopped
        userId
    }
    let applications: ApplicationClass[] = await Application.find(filters)
        .sort({applicationDate: 1})
        .limit(50)
    const totalCount: number = await Application.count(filters)

    // Fill in jobs as well
    applications = await addJobs(applications)

    return [applications, totalCount]
}


// todo this desc
export async function addJobs(applications: ApplicationClass[]) {
    // const jobIds = applications.map((application) => application.jobId)

    // Loop over each application and add job data.
    for (const application of applications) {

        // tslint:disable-next-line:no-console
        console.log("Checking application now...:", application.jobId)

        application.job = await Job.findOne({_id: application.jobId})
    }

    return applications
}

