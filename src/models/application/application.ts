import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'
import * as mongoose from 'mongoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Job, JobClass } from '../job/job'
import { UserJob } from '../userJob/userJob'

@modelOptions({ options: { customName: 'application' } })
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

export const Application = getModelForClass(ApplicationClass)

export async function findAll(
    userId: mongoose.Types.ObjectId,
    allStatusFilter: boolean,
    appliedStatusFilter: boolean,
    userDeclinedStatusFilter: boolean,
    companyDeclinedStatusFilter: boolean
): Promise<[ApplicationClass[], number, number, number]> {
    const filters: { $or?: { [key: string]: any }[]; userId: mongoose.Types.ObjectId } = {
        $or: [],
        userId,
    }

    if (allStatusFilter) {
        delete filters.$or
    } else {
        if (appliedStatusFilter) {
            filters.$or.push({ status: 'applied' })
        }
        if (userDeclinedStatusFilter) {
            filters.$or.push({ status: 'userdeclined' })
        }
        if (companyDeclinedStatusFilter) {
            filters.$or.push({ status: 'companydeclined' })
        }

        // If none default to applied only.
        if (!filters.$or || filters.$or.length === 0) {
            filters.$or.push({ status: 'applied' })
        }
    }

    // tslint:disable-next-line:no-console
    console.log('filters', filters)

    let applications: ApplicationClass[] = await Application.find(filters).sort({ applicationDate: -1 }).limit(50)
    const totalCount: number = await Application.count(filters)

    // Fill in jobs as well
    applications = await addJobs(applications)

    const avgSalaryMin = getAverageSalary(applications, 'salaryMin')
    const avgSalaryMax = getAverageSalary(applications, 'salaryMax')

    return [applications, totalCount, avgSalaryMin, avgSalaryMax]
}

function getAverageSalary(applications: ApplicationClass[], field: 'salaryMin' | 'salaryMax'): number {
    if (!applications || !applications.length) {
        return 0
    }

    let totalSalary = 0
    let validJobs = 0
    for (const application of applications) {
        if (typeof application.job[field] !== 'undefined') {
            totalSalary += application.job[field]
            validJobs++
        }
    }

    const averageSalary = validJobs ? totalSalary / validJobs : 0
    return Math.round(averageSalary / 1000) * 1000
}

// Given a list of application, add in some job details also.
export async function addJobs(applications: ApplicationClass[]) {
    // const jobIds = applications.map((application) => application.jobId)

    // Loop over each application and add jobs extra data.
    for (const application of applications) {
        application.job = await Job.findOne({ _id: application.jobId })
    }

    return applications
}

export async function changeApplicationStatus(applicationId: mongoose.Types.ObjectId, status: string) {
    // tslint:disable-next-line:no-console
    console.log('saving to applicationId now = ' + applicationId)
    // tslint:disable-next-line:no-console
    console.log('saving to status = ' + status)
    if (status === '') {
        return // noop
    }

    // tslint:disable-next-line:no-console
    console.log('creating new application and status = ' + status, applicationId)

    // Check if we already have an application in, if so leave early.
    const app = await Application.findOne({ _id: applicationId })
    app.status = status
    await app.save()
}
