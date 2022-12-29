const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const username = "tmtuser";
const password = "czNL0ALxSoeFoddu";
console.log(username, password);

const uri = `mongodb+srv://${username}:${password}@cluster0.fceds.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


async function run() {
    try {
        const tasksCollection = client.db("tmtDb").collection("tasks");
        app.post('/add-task', async (req, res) => {
            const task = req.body;
            const result = await tasksCollection.insertOne(task);
            console.log('Task Added', result);
            res.send(result);
        })

        app.get('/tasks', async (req, res) => {
            const query = {};
            const tasks = await tasksCollection.find(query).toArray();
            console.log('Get Tasks', tasks);
            res.send(tasks);
        })

        app.delete('/tasks/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const result = await tasksCollection.deleteOne(query);
            res.send(result)
        })

        // app.patch('/tasks/:id', async (req, res) => {
        //     const query = { _id: ObjectId(req.params.id) };
        //     const newValues = { $set: { status: req.body.status } };
        //     const result = await tasksCollection.updateOne(query, newValues);
        //     res.send(result)
        // })

        app.patch('/update/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const task = req.body;
            const query = { _id: ObjectId(id) };
            const newValues = { $set: { ...task } };
            const result = await tasksCollection.updateOne(query, newValues);
            res.send(result)
        })

    } catch (err) {
        console.log(err.stack);
    } finally {
        // await client.close();
    }
}

run().catch(console.log);

app.get('/', (req, res) => {
    res.send('TMT-Task Management App is Running')
})

app.listen(port, () => {
    console.log(`TMT Server is Running at http://localhost:${port}`)
})