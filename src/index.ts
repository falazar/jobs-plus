import dotenv from "dotenv";
import express from "express";
import path from "path";
import * as routes from "./routes";
// import {MongoClient} from "mongodb";
// import * as mongoDB from "mongodb";



dotenv.config();


import { Schema, model, connect } from 'mongoose';

// tslint:disable-next-line:no-console
run().catch(err => console.log(err));

async function run() {
    // 4. Connect to MongoDB
    await connect('mongodb://localhost:27017/test');
// tslint:disable-next-line:no-console
    console.log("DB Connected")
}


const port = process.env.SERVER_PORT;
const app = express();

app.use(express.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

// Configure routes
routes.register(app);

// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
