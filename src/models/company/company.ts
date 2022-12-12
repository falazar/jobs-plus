class Company {
    public _id: string
    public name: string
    public sector: string
    public city: string
    public state: string

    constructor(
        _id: string,
        name: string,
        sector: string,
        city: string,
         state: string
    ) {
        this._id = _id
        this.name = name
        this.sector = sector
        this.city = city
        this.state = state
    }
}


async function loadCompanies() {
    // noop
}

export {loadCompanies};

