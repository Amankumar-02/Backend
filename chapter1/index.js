// inport env package
require('dotenv').config()

const express = require('express')
// import express from 'express';  ==> same syntax as above
const app = express()
// here this port is free, sometimes the port is already in 
// used then the server creates a new port automatically.
const port = 3000

const profileData = {
    "login": "Amankumar-02",
    "id": 118505622,
    "node_id": "U_kgDOBxBAlg",
    "avatar_url": "https://avatars.githubusercontent.com/u/118505622?v=4",
    "gravatar_id": "",
    "url": "https://api.github.com/users/Amankumar-02",
    "html_url": "https://github.com/Amankumar-02",
    "followers_url": "https://api.github.com/users/Amankumar-02/followers",
    "following_url": "https://api.github.com/users/Amankumar-02/following{/other_user}",
    "gists_url": "https://api.github.com/users/Amankumar-02/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/Amankumar-02/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/Amankumar-02/subscriptions",
    "organizations_url": "https://api.github.com/users/Amankumar-02/orgs",
    "repos_url": "https://api.github.com/users/Amankumar-02/repos",
    "events_url": "https://api.github.com/users/Amankumar-02/events{/privacy}",
    "received_events_url": "https://api.github.com/users/Amankumar-02/received_events",
    "type": "User",
    "site_admin": false,
    "name": "Aman Kumar",
    "company": null,
    "blog": "",
    "location": "New Delhi",
    "email": null,
    "hireable": null,
    "bio": "🌱 Currently exploring new technologies and frameworks to enhance my skills and knowledge.",
    "twitter_username": null,
    "public_repos": 18,
    "public_gists": 0,
    "followers": 2,
    "following": 7,
    "created_at": "2022-11-18T05:57:58Z",
    "updated_at": "2024-03-11T09:47:37Z"
  }

// here '/' is the request by frontend, then the response will pass to frontend 
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/about', (req, res)=>{
    res.send("Hello i am about!")
})

app.get('/login', (req, res)=>{
    res.send('<h2>Login Page</h2>')
})

app.get('/contact', (req, res)=>{
    res.send('<h1>Hello I am Contact Page from server</h1>')
})

app.get('/github', (req, res)=>{
    res.json(profileData)
})

// Here, it listens the frontend request till the server is running/ reload.
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})