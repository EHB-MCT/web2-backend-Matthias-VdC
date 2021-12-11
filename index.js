//Basic setup done by help from Mike Derycke's youtube
//Source: https://www.youtube.com/watch?v=p3O6YcUUJmE&t=201s   (Channel: https://www.youtube.com/channel/UChlEg91ycOHnDSicCluhbDA)
//Also used code and structure from previous exercise: "Full Stack Teamwork"
//Source: https://github.com/EHB-MCT/web2-groupproject-backend-team-sam

const {
    MongoClient,
    ObjectId
} = require("mongodb");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const client = new MongoClient(process.env.FINAL_URL);
const app = express();
const port = process.env.PORT || 1337;
const DbName = "CourseProject";

//use everything from public folder
app.use(express.static('public'))
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
})

app.listen(port, () => {
    console.log(`API running at at http://localhost:${port}`)
})

// Add UserData
app.post('/challenges/send', async (req, res) => {
    if (!req.body.name || !req.body.points || !req.body.course || !req.body.session) {
        res.status(400).send("Bad request, missing: id, name, points, course or session!");
        return;
    }

    try {
        await client.connect();
        const challengeCollect = client.db("Session7").collection("Challenges");

        const db = await challengeCollect.findOne({
            _id: req.body._id
        });
        if (db) {
            res.status(400).send("Bad request: challenge already exists with id " + req.body.id);
            return;
        }

        let newChallenge = {
            _id: req.body.id,
            name: req.body.name,
            points: req.body.points,
            course: req.body.course,
            session: req.body.session
        }

        let insertChallenge = await challengeCollect.insertOne(newChallenge);

        res.status(201).send(`Challenge succesfully saved with name ${req.body.name}`);
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