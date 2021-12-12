//Basic setup done by help from Mike Derycke's youtube
//Source: https://www.youtube.com/watch?v=p3O6YcUUJmE&t=201s   (Channel: https://www.youtube.com/channel/UChlEg91ycOHnDSicCluhbDA)

//Also used / adapted code and structure from previous exercise: "Full Stack Teamwork"
//Source: https://github.com/EHB-MCT/web2-groupproject-backend-team-sam

//Hashing password used youtube video
//Source: https://www.youtube.com/watch?v=9yIrM7eZwUE   (Channel: https://www.youtube.com/channel/UCDdAZtsEcn3IxBaDVjkjBGg)

require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
    MongoClient,
    ObjectId
} = require("mongodb");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const client = new MongoClient(process.env.FINAL_URL);
const app = express();
const port = process.env.PORT || 1337;
const dbName = "CourseProject";

//use everything from public folder
app.use(express.static('public'));
app.use(bodyParser.json());
//THE FLOODGATES ARE OPEN
app.use(cors());

app.use((req, res, next) => {
    //Allows requests without credentials from anyone
    //Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

//Main API page
app.get('/', (req, res) => {
    //status 300 shows that there are multiple options the client can choose from
    //Source: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
    res.status(300).redirect('/api-info.html');
});


//Get userData
app.get('/userdata/get', async (req, res) => {
    try {
        //connect to the database
        await client.connect();
        const db = client.db(dbName);

        // Use the collection "Session7"
        const col = db.collection("userData");

        // Find document
        const myDoc = await col.find({}).toArray();

        // Print to the console
        console.log(myDoc);

        //Send back the data with the response
        res.status(200).send(myDoc);

    } catch (err) {
        console.log(err.stack);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});

//Register UserData
app.post('/userdata/register', async (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(400).send("Bad request, missing: email or password!");
        return;
    }

    try {
        await client.connect();
        const dataCollect = client.db(dbName).collection("userData");

        const db = await dataCollect.findOne({
            _id: req.body._id
        });
        if (db) {
            res.status(400).send("Bad request: data already exists with id " + req.body.id);
            return;
        }

        let newUser = {
            _id: req.body.id,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10)
        }

        let insertData = await dataCollect.insertOne(newUser);

        res.status(201).send(`User Data succesfully saved!`);
        return;

    } catch (err) {
        console.log(err);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});


app.post('/userdata/login', async (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(400).send("Bad request, missing: email or password!");
        return;
    }

    try {
        await client.connect();
        const userDataCollect = client.db(dbName).collection("userData").first('*').where({
            email: req.body.email
        });

        if (userDataCollect) {
            //returns true or false
            const validateHash = await bcrypt.compare(req.body.password, userDataCollect.hash);
            if (validateHash) {
                res.status(200).send('Valid Email and Password!')
            } else {
                res.send('Wrong password!')
            }
        } else {
            res.status(404).send('User not found');
        }

    } catch (err) {
        console.log(err);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`API running at at http://localhost:${port}`)
});