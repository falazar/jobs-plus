class Job {
    // createdDate

    constructor(
        private _id: string,
        public title: string,
        public company: string,
        public salary: number
    ) {
    }

    // public getBirthYear() {
    //     return new Date().getFullYear() - this.age;
    // }
}


// Load all jobs now from db....
async function loadUsersJobs(userId: string) {  // todo ObjectId
    const jobs = [];
    // TODO load from local db.

    // tslint:disable-next-line:no-console
    console.log('userId', userId)

    // TODO Hard code sample set here.
    jobs.push(new Job("1", "Junior Developer", "CyberCoders", 50000));
    jobs.push(new Job("2", "Middle Level Developer", "Lending Tree", 150000));
    jobs.push(new Job("3", "Senior Developer", "Indeed", 200000));

    return jobs;
}

// Given a user, search for new jobs to display for them.
async function searchJobs(search: string) {
    const jobs = [];
    // TODO load from local db.
    // const jobs = db.find('job', search)

    // tslint:disable-next-line:no-console
    console.log('search inside', search)

    // TODO Hard code sample set here.
    jobs.push(new Job("1", "Junior Developer", "CyberCoders", 50000));

    return jobs;
}

export {loadUsersJobs, searchJobs};

