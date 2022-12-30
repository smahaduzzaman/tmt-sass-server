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

const uri = `mongodb+srv://${username}:${password}@cluster0.fceds.mongodb.net/?retryWrites=true&w=majority`;
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
        const usersCollection = client.db("tmtDb").collection("users");
        const tasksCollection = client.db("tmtDb").collection("tasks");

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })


        app.post('/add-task', async (req, res) => {
            const task = req.body;
            const result = await tasksCollection.insertOne(task);
            res.send(result);
        })

        app.get('/tasks/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const tasks = await tasksCollection.find(query).toArray();
            const myTask = tasks.filter(t => !t.completed)
            res.send(myTask);
        })

        app.get('/complete-task/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const tasks = await tasksCollection.find(query).toArray();
            const completeTask = tasks.filter(n => n.completed)
            res.send(completeTask);
        })

        // app.get('/tasks', async (req, res) => {
        //     const query = {};
        //     const tasks = await tasksCollection.find(query).toArray();
        //     console.log('Get Tasks', tasks);
        //     res.send(tasks);
        // })

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
            const task = req.body;
            const query = { _id: ObjectId(id) };
            const newValues = { $set: { ...task } };
            console.log({ ...task });
            const result = await tasksCollection.updateMany(query, newValues);
            res.send(result)
        })

        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const complete = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: complete
            }
            const result = await tasksCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
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