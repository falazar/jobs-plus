class Company {
    public id: string
    public name: string
    public sector: string
    public city: string
    public state: string

    constructor(
        id: string,
        name: string,
        sector: string,
        city: string,
         state: string
    ) {
        this.id = id
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

