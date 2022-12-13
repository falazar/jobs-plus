import dotenv from "dotenv";
import express from "express";
import path from "path";
import * as routes from "./routes";
import * as mongoose from 'mongoose'


dotenv.config()


// TODO
// https://developer.okta.com/blog/2018/11/15/node-express-typescript  okta


// tslint:disable-next-line:no-console
run().catch(err => console.log(err))

async function run() {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/', {dbName: 'test'});
    // tslint:disable-next-line:no-console
    console.log("DB Connected");

    const port = process.env.SERVER_PORT;
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(express.static(path.join(__dirname, "public")));

    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");

    // Configure routes
    routes.register(app);

    // start the express server
    app.listen(port, () => {
        // tslint:disable-next-line:no-console
        console.log(`Server started at http://localhost:${port}`);
    });

}

