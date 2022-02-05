const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const res = require('express/lib/response');
const { route } = require('./interviewer');
const { job, jobApplicationHistory, interviewee, hrJobPostHistory, humanResource } = new PrismaClient();

// GET API Endpoints
router.get('/', async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error)
    }
});

// Get all jobs posted by HR
router.get('/:humanResourceEmail', async (req, res, next) => {
    try {
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

        let jobsPostedByHR = await hrJobPostHistory.findMany({
            where: {
                humanResourceId: id
            },
            select: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: {
                            select: {
                                companyName: true
                            }
                        }
                    }
                }
            }
        });

        res.json(jobsPostedByHR);
    } catch (error) {
        next(error);
    }
});

// POST API Endpoints
router.post('/apply', async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error)
    }
});

module.exports = router;