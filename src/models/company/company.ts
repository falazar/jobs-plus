import {getModelForClass, modelOptions, prop} from "@typegoose/typegoose";
import * as mongoose from "mongoose";
import {TimeStamps} from "@typegoose/typegoose/lib/defaultClasses";

@modelOptions({options: {customName: 'company'}})
export class CompanyClass extends TimeStamps {
    _id: mongoose.Types.ObjectId

    @prop()
    public name: string

    @prop()
    public sector?: string

    @prop()
    city?: string

    @prop()
    state?: string
}

export const Company = getModelForClass(CompanyClass);


// Given a list of company names load all company objects now.
export async function loadCompanies(companyNames:string[]): Promise<CompanyClass[]> {
    const companies = await Company.find({ name: { $in: companyNames } });
    return companies
}

// todo move this to other areas later.
// Given a string list of companies, add them now to the db if they are new.
export async function saveNewCompanies(companyNames: string[]) {
    // tslint:disable-next-line:no-console
    console.log("Saving new companies now...")

    const companies: any[] = []
    companyNames.forEach((company) => {
        companies.push({
            _id: new mongoose.Types.ObjectId(),
            name: company
        })
    })

    // Step 2: Call to query to find dupes.
    const knownCompanies = await Company.find({name: {$in: companyNames}})
    const knownCompanyNames = knownCompanies.map((company) => company.name)

    // Step 3:  Remove those from this list.
    const newCompanies = companies.filter((company) => !knownCompanyNames.includes(company.name))
    // tslint:disable-next-line:no-console
    console.log('newCompanies = ', newCompanies)

    // Step 4: Add those new ones in now
    if (newCompanies.length > 0) {
        // tslint:disable-next-line:no-console
        console.log('Inserting newCompanies count = ', newCompanies.length)
        await Company.insertMany(newCompanies)
    } else {
        // tslint:disable-next-line:no-console
        console.log("Inserting no new companies, no new found.")
    }

}