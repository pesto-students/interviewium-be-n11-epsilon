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
})


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

module.exports = router;