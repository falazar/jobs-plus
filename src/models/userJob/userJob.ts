import {getModelForClass, modelOptions, prop} from "@typegoose/typegoose";
import * as mongoose from "mongoose";
import {Application} from "../application/application";
import {Job} from "../job/job";

@modelOptions({options: {customName: 'userJob'}})
export class UserJobClass {
    public _id: mongoose.Types.ObjectId
    @prop()
    public userId: mongoose.Types.ObjectId
    @prop()
    public jobId: mongoose.Types.ObjectId
    @prop()
    public status: string

    constructor(
        _id: mongoose.Types.ObjectId,
        userId: mongoose.Types.ObjectId,
        jobId: mongoose.Types.ObjectId,
        status: string
    ) {
        this._id = _id
        this.userId = userId
        this.jobId = jobId
        this.status = status
    }
}

export const UserJob = getModelForClass(UserJobClass)

export async function saveUserJob(jobId: mongoose.Types.ObjectId, status: string) {
    // tslint:disable-next-line:no-console
    console.log("saving to jobId now = " + jobId)
    // tslint:disable-next-line:no-console
    console.log("saving to status = " + status)

    const userId = new mongoose.Types.ObjectId('1'.repeat(24))
    // not quite working hmmm
    await UserJob.updateOne({jobId, userId},
        {
            $set: {jobId, userId, status}
        },
        {upsert: true}
    )

    // If status is applied, then we need to create that record too.
    if (status === "applied") {
        // tslint:disable-next-line:no-console
        console.log("creating new application and status = " + status, userId, jobId)

        // Check if we already have an application in, if so leave early.
        const foundApp = await Application.findOne({ userId, jobId })
        // tslint:disable-next-line:no-console
        console.log("found app = ", foundApp)
        if (foundApp) {
            // tslint:disable-next-line:no-console
            console.log("DEBUG not creating dupe application  now...")
            // noop
            return
        }

        const app = {
            _id: new mongoose.Types.ObjectId(),
            userId,
            jobId,
            status: "applied",
            applicationDate: new Date()
        }
        await Application.insertMany(app)

    }

}



