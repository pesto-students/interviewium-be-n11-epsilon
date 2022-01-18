const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const res = require('express/lib/response');
const { interviewee, jobApplicationHistory, humanResource, ongoingInterviewStatus } = new PrismaClient();

// GET Endpoints
// Returns a list of all interviewees in our ecosystem
router.get('/', async (req, res) => {
    let interviewees = await interviewee.findMany({});

    res.json(interviewees);
});

// Returns interviewee, identified by email
router.get('/:email', async (req, res) => {
    let intervieweeEmail = req.params.email;

    let foundInterviewee = await interviewee.findUnique({
        where: {
            email: intervieweeEmail
        }
    });

    res.json(foundInterviewee);
});

/* 
   Returns all interviewees waiting on interviewer assignment, across
   all jobs posted by a HR
*/
router.get('/waitingAssignment/:humanResourceEmail', async (req, res) => {
    let humanResourceEmail = req.params.humanResourceEmail;
    // From Human Resource email, fetch human resource ID
    let { id } = await humanResource.findUnique({
        select: {
            id: true
        },
        where: {
            email: humanResourceEmail
        }
    });

    let jobApplicationsTaggedToHRInShortlistedStatus = await jobApplicationHistory.findMany({
        where: {
            humanResourceId: id,
            applicationStatus: "WAITING_FOR_INTERVIEWER_ASSIGNMENT"
        }
    });

    res.json(jobApplicationsTaggedToHRInShortlistedStatus);
})

// POST Endpoints
// Assigns interviewer to interviewees waiting for interviewer assignment, for a particular job
// This creates a new record in Ongoing Interview Status table
router.post('/assignInterviewer', async (req, res) => {
    let intervieweeId = req.body.intervieweeId;
    let jobId = req.body.jobId; 
    let humanResourceId = req.body.humanResourceId;
    let interviewerId = req.body.interviewerId;
    
    let { currentInterviewRound } = await jobApplicationHistory.findFirst({
        where: {
            intervieweeId: intervieweeId,
            jobId: jobId
        },
        select: {
            currentInterviewRound: true
        }
    })

    let newOngoingInterviewRecord = await ongoingInterviewStatus.create({
        data: {
            intervieweeId: intervieweeId,
            jobId: jobId,
            humanResourceId: humanResourceId,
            interviewerId: interviewerId,
            joiningLink: "https://us05web.zoom.us/j/4987381767?pwd=UEM0MkN1aEFHcU9wRFRSaUVnd1gzUT09",
            interviewRoundNumber: currentInterviewRound + 1,
            interviewDateTime: new Date() // TODO: change this logic
        }
    })

    res.json(newOngoingInterviewRecord);
})

module.exports = router

// PUT Endpoints
/*
    1. Moves the interviewee's job application status to WAITING_FOR_INTERVIEWER_ASSIGNMENT
    2. Sets current interview round number to 1
    3. Sets Shortlisted At datetime to current date-time
*/
router.put('/shortlist', async (req, res) => {
    let intervieweeId = req.body.intervieweeId; 
    let jobId = req.body.jobId; 

    let { id } = await jobApplicationHistory.findFirst({
        where: {
            intervieweeId: intervieweeId,
            jobId: jobId
        },
        select: {
            id: true
        }
    })

    let updatedJobApplication = await jobApplicationHistory.update({
        where: {
            id: id
        },
        data: {
            applicationStatus: "WAITING_FOR_INTERVIEWER_ASSIGNMENT",
            currentInterviewRound: 0,
            shortlistedAt: new Date()
        }
    });

    res.json(updatedJobApplication);
});