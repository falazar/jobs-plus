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

