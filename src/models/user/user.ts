export class User {
    public _id: string
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
        _id: string,
        firstName: string,
        lastName: string,
        preferredSector: string,
        city: string,
        state: string
    ) {
        this._id = _id
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

