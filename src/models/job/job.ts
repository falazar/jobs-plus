class Job {
    public title: string
    public company: string
    public salary: number

    // createdDate

    constructor(
        title: string,
        company: string,
        salary: number
    ) {
        this.title = title
        this.company = company
        this.salary = salary
    }

    // public getBirthYear() {
    //     return new Date().getFullYear() - this.age;
    // }
}


// Given a user, search for new jobs to display for them.
async function loadUsersJobs(userId: string) {  // todo ObjectId
    const jobs = [];
    // TODO load from local db.

    // tslint:disable-next-line:no-console
    console.log('userId', userId)

    jobs.push(new Job("Junior Developer", "CyberCoders", 50000));
    jobs.push(new Job("Middle Level Developer", "Lending Tree", 150000));
    jobs.push(new Job("Senior Developer", "Indeed", 200000));

    return jobs;
}

export {loadUsersJobs};

