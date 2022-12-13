import {getModelForClass, modelOptions, prop} from "@typegoose/typegoose";
import * as mongoose from "mongoose";

@modelOptions({options: {customName: 'company'}})
export class CompanyClass {
    @prop()
    _id: mongoose.Types.ObjectId

    @prop()
    public name: string

    @prop()
    public sector: string

    @prop()
    city: string

    @prop()
    state: string
}

export const Company = getModelForClass(CompanyClass);


// TODO later need to load by a list of ids
export async function loadCompanies(): Promise<CompanyClass[]> {  // todo add return type
    // const {_id: id} = await Company.create({name: 'JohnDoe', jobs: ['Cleaner']});
    // const companies = await Company.findById(id).exec();
    const companies = await Company.find({});

    return companies
}

