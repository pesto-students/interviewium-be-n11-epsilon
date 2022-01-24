const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const res = require('express/lib/response');
const { route } = require('./interviewer');
const { job, jobApplicationHistory, interviewee } = new PrismaClient();

// GET API Endpoints
router.get('/', async (req, res) => {
    let allJobs = await job.findMany({
        select: {
            id: true,
            humanResourceId: true,
            title: true,
            company: {
                select: {
                    companyName: true
                }
            },
            primaryAndSecondarySkills: true,
            minExperienceInYears: true,
            maxExperienceInYears: true,
            jobDescription: true
        }
    });
    res.json(allJobs);
});

// POST API Endpoints
router.post('/apply', async (req, res) => {
    let intervieweeEmail = req.body.intervieweeEmail;
    let humanResourceId = req.body.humanResourceId;
    let jobId = req.body.jobId;

    // Get interviewee ID from interviewee email
    let { id } = await interviewee.findUnique({
        where: {
            email: intervieweeEmail
        },
        select: {
            id: true
        }
    });

    let newJobApplicationHistoryRecord = await jobApplicationHistory.create({
        data: {
            intervieweeId: id,
            humanResourceId: humanResourceId,
            jobId: jobId,
            currentInterviewRound: 0
        }
    });

    res.json(newJobApplicationHistoryRecord);
})

module.exports = router;