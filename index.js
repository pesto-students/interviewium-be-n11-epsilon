const express = require("express");
const cors = require("cors")
const app = express()

const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get("/status", async(req, res) => {
    res.json("Interviewium Backend Service Running");
})

app.use('/api/humanResource', require('./routes/humanResource.js'));
app.use('/api/interviewee', require('./routes/interviewee.js'));
app.use('/api/interviewer', require('./routes/interviewer.js'));

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})