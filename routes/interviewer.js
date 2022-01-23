const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const res = require('express/lib/response');
const { interviewer, hrInterviewerInviteHistory, humanResource, ongoingInterviewStatus } = new PrismaClient();

// GET Endpoints
/*
    Returns:
    1. Number of interviews for today
    2. Number of scheduled interviews
    3. Number of interviewers taken by the interviewer, where interviewees
       are awaiting review
*/
router.get('/dashboardMetrics/:email', async (req, res) => {
    // TODO: change from hardcoded data
    let metrics = {}
    metrics["interviewsToday"] = 2;
    metrics["scheduledInterviews"] = 3;
    metrics["waitingForReview"] = 1;
    res.json(metrics);
});

router.get('/today/:email', async (req, res) => {
    // TODO: revise logic
    let interviewerEmail = req.params.email;
    // Get interviewer ID from interviewer email
    let { id } = await interviewer.findFirst({
        where: {
            email: interviewerEmail
        },
        select: {
            id: true
        }
    });

    let allInterviews = await ongoingInterviewStatus.findMany({
        where: {
            interviewerId: id,
        }
    });

    res.json(allInterviews);
});

router.get('/calendlyLink/:email', async (req, res) => {
    let interviewerEmail = req.params.email;

    let { calendlyLink } = await interviewer.findUnique({
        where: {
            email: interviewerEmail
        }, 
        select: {
            calendlyLink: true
        }
    });

    res.json(calendlyLink);
})

router.get('/feedbacksPending/:email', async (req, res) => {
    let interviewerEmail = req.params.email;
    // Get interviewer ID from interviewer email
    let { id } = await interviewer.findFirst({
        where: {
            email: interviewerEmail
        },
        select: {
            id: true
        }
    });

    let feedbacksPending = await ongoingInterviewStatus.findMany({
        where: {
            interviewerId: id,
            interviewerVerdict: "UNDECIDED"
        }
    });

    res.json(feedbacksPending);
});

/*
    Returns:
    1. Number of interviews taken by the interviewer
    2. Number of candidates passed by the interviewer
*/
router.get('/graph/:email', async (req, res) => {
    let interviewerEmail = req.params.email;
    // Get interviewer ID from interviewer email
    let { id } = await interviewer.findFirst({
        where: {
            email: interviewerEmail
        },
        select: {
            id: true
        }
    });

    let finalQueryResult = {};
    let interviewsTaken = await ongoingInterviewStatus.count({
        where: {
            interviewerId: id
        }
    });
    finalQueryResult["interviewsTaken"] = interviewsTaken;

    let passedCandidatesCount = await ongoingInterviewStatus.count({
        where: {
            interviewerId: id,
            interviewerVerdict: "PASSED"
        }
    });
    finalQueryResult["passedCandidatesCount"] = passedCandidatesCount;

    res.json(finalQueryResult);
})

router.get('/:humanResourceEmail', async (req, res) => {
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

    let interviewers = await hrInterviewerInviteHistory.findMany({
        where: {
            humanResourceId: id
        },
        include: {
            interviewer: true
        }
    });

    res.json(interviewers);
});

router.get('/profile/:email', async (req, res) => {
    let interviewerEmail = req.params.email;
    
    let interviewerProfile = await interviewer.findUnique({
        where: {
            email: interviewerEmail
        },
        include: {
            company: true
        }
    });

    res.json(interviewerProfile);
});

/*
    Returns all interviews taken by the interviewer with:
    1. Interviewee name
    2. Interviewee email
    3. Interview round number
    4. Interviewer's verdict
    5. Job Title
    6. Job ID
*/
router.get('/interviews/:email', async (req, res) => {
    let interviewerEmail = req.params.email;
    // From Interviewer email, fetch interviewer ID
    let { id } = await interviewer.findUnique({
        select: {
            id: true
        },
        where: {
            email: interviewerEmail
        }
    });

    let verdictsAndFeedbacks = await ongoingInterviewStatus.findMany({
        where: {
            interviewerId: id
        },
        select: {
            interviewRoundNumber: true,
            interviewerVerdict: true,
            interviewee: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            job: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    });

    res.json(verdictsAndFeedbacks);
});

// POST Endpoints

// PUT
// Set/update Calendly Link
router.put('/calendlyLink/:email', async (req, res) => {
    let interviewerEmail = req.params.email;
    let newCalendlyLink = req.body.calendlyLink;

    let { calendlyLink } = await interviewer.update({
        where: {
            email: interviewerEmail
        }, 
        data: {
            calendlyLink: newCalendlyLink
        },
        select: {
            calendlyLink: true
        }
    });

    res.json(calendlyLink);
});

// Update interview verdict (where inteview is identified
// uniquely by an interviewee ID & job ID)
router.put('/updateVerdictAndReview', async (req, res) => {
    let intervieweeId = req.body.intervieweeId;
    let jobId = req.body.jobId; 
    let interviewerVerdict = req.body.interviewerVerdict; // PASSED, FAILED or UNDECIDED?
    let interviewerReview = req.body.interviewerReview;

    // Fetch ongoing interview record ID, from interviewee ID & job ID
    let { id } = await ongoingInterviewStatus.findFirst({
        where: {
            intervieweeId: intervieweeId,
            jobId: jobId
        },
        select: {
            id: true
        }
    });

    let updatedOngoingInterviewRecord = await ongoingInterviewStatus.update({
        where: {
            id: id
        },
        data: {
            interviewerVerdict: interviewerVerdict,
            interviewerReview: interviewerReview
        }
    });

    res.json(updatedOngoingInterviewRecord);
});

module.exports = router;