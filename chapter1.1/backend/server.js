// import using module js
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// app.get("/", (req, res) => {
//     res.send("Hello World")
// })

app.get("/api/jokes", (req, res)=>{
    const jokes = [
        {id:1, title:"A first Joke", content:"This is a first Joke."},
        {id:2, title:"A second Joke", content:"This is a second Joke."},
        {id:3, title:"A third Joke", content:"This is a third Joke."},
        {id:4, title:"A forth Joke", content:"This is a forth Joke."},
        {id:5, title:"A fifth Joke", content:"This is a fifth Joke."},
    ]
    res.send(jokes);
})

app.listen(port, () => {
    console.log("Server Start", port);
})