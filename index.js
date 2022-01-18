const express = require("express");
const app = express()

app.use(express.json())

app.get("/status", async(req, res) => {
    res.json("Interviewium Backend Service Running");
})

app.use('/api/humanResource', require('./routes/humanResource.js'));
app.use('/api/interviewee', require('./routes/interviewee.js'));
app.use('/api/interviewer', require('./routes/interviewer.js'));

app.listen(3000, () => {
    console.log("Listening on port 3000")
})