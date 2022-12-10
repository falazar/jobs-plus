class User {
    public id: string
    public firstName: string
    public lastName: string
    public city: string
    public state: string
    // email
    // password
    // createdDate
    // lastLoggedIn
    public preferredSector: string // TODO

    constructor(
        id: string,
        firstName: string,
        lastName: string,
        preferredSector: string,
        city: string,
        state: string
    ) {
        this.id = id
        this.firstName = firstName
        this.lastName = lastName
        this.preferredSector = preferredSector
        this.city = city
        this.state = state
    }
}


async function loadUsers() {
    // noop
}

export {loadUsers};

