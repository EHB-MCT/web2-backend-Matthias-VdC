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
const collectionName = "userData";

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
        const col = db.collection(collectionName);

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

//Get one userData
app.get('/userdata/get/one/:id', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db(dbName).collection(collectionName);

        const query = {
            _id: ObjectId(req.params.id)
        };
        const found = await collection.findOne(query);
        if (found) {
            res.status(200).send(found);
            return;
        } else {
            res.status(400).send('Challenge could not found with id: ' + req.params.id);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        })
    } finally {
        await client.close();
    }
})

//Register userData
app.post('/userdata/register', async (req, res) => {
    if (!req.body.email || !req.body.password || !req.body.username) {
        res.status(400).send("Bad request, missing: email or password!");
        return;
    }

    try {
        await client.connect();
        const dataCollect = client.db(dbName).collection(collectionName);

        const db = await dataCollect.findOne({
            email: req.body.email
        });

        if (db) {
            res.status(400).send("Bad request: user already exists with email:" + req.body.email);
            return;
        }

        let newUser = {
            _id: req.body.id,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
            username: req.body.username,
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

//User verifies userData
app.post('/userdata/login', async (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(400).send("Bad request, missing: email or password!");
        return;
    }

    try {
        await client.connect();

        const userData = await client.db(dbName).collection(collectionName).findOne({
            email: req.body.email
        });

        const sending = {
            login: true,
            id: userData._id
        }
        if (userData) {
            const hashedPass = await bcrypt.compare(req.body.password, userData.password);
            if (hashedPass) {

                res.send(sending);

            } else {
                res.send("Wrong username or password!");
            }
        } else {
            res.send("Missing username or password!");
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

//Change userName
app.put('/userdata/change/name/:id', async (req, res) => {
    if (!req.body.username) {
        res.status(400).send("Bad request, missing: name");
        return;
    }
    try {
        await client.connect();
        const collection = client.db(dbName).collection(collectionName);
        const query = {
            _id: ObjectId(req.params.id)
        };

        let update = {
            $set: {
                username: req.body.username
            }
        };

        const updateName = await collection.updateOne(query, update)
        if (updateName) {
            res.status(201).send(`Challenge with id "${req.body._id}" with succes updated!.`);
            return;
        } else {
            res.status(400).send('Challenge could not found with id: ' + req.body._id);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});

//Delete a user
app.delete('/userdata/delete/:id', async (req, res) => {
    try {
        await client.connect();

        const collection = client.db(dbName).collection(collectionName);

        const query = {
            _id: ObjectId(req.params.id)
        };

        await collection.deleteOne(query)
        res.status(200).json({
            succes: 'Succesfully deleted!',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        })
    }
})

app.listen(port, () => {
    console.log(`API running at at http://localhost:${port}`)
});