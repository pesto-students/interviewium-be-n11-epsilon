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

/*
    Returns:
    1. Number of jobs the interviewee has applied for
    2. Number of shortlists received, across all jobs applied by interviewee
    3. Number of ongoing interviews for the interviewee
*/
router.get('/dashboardHeader/:email', async (req, res) => {
    let intervieweeEmail = req.params.email;
    // From interviewee email, fetch interviewee ID
    let { id } = await interviewee.findUnique({
        where: {
            email: intervieweeEmail
        },
        select: {
            id: true
        }
    });

    let finalQueryResult = {}

    let numberOfJobsApplied = await jobApplicationHistory.count({
        where: {
            intervieweeId: id
        }
    });
    finalQueryResult["numberOfJobsApplied"] = numberOfJobsApplied;

    let numberOfShortlistsReceived = await jobApplicationHistory.count({
        where: {
            intervieweeId: id,
            NOT: [
                {
                    applicationStatus: "APPLIED"
                }
            ]
        }
    });
    finalQueryResult["numberOfShortlistsReceived"] = numberOfShortlistsReceived;

    let numberOfOngoingInterviews = await jobApplicationHistory.count({
        where: {
            intervieweeId: id,
            OR: [
                {
                    applicationStatus: "WAITING_FOR_INTERVIEWER_ASSIGNMENT"
                },
                {
                    applicationStatus: "ONGOING"
                },
                {
                    applicationStatus: "PASSED"
                }
            ]
        }
    });
    finalQueryResult['numberOfOngoingInterviews'] = numberOfOngoingInterviews;

    res.json(finalQueryResult);
});

router.get('/interviewsForToday/:email', async (req, res) => {
    let intervieweeEmail = req.params.email;
    // From interviewee email, fetch interviewee ID
    let { id } = await interviewee.findUnique({
        where: {
            email: intervieweeEmail
        },
        select: {
            id: true
        }
    });

    let currentDate = new Date();

    let interviews = await ongoingInterviewStatus.findMany({
        where: {
            intervieweeId: id
        },
        select: {
            interviewDateTime: true,
            interviewRoundNumber: true,
            joiningLink: true,
            job: {
                select: {
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

    interviewsForToday = [];
    for(let idx = 0; idx < interviews.length; idx++) {
        let interviewDateTime = interviews[idx].interviewDateTime;
    
        let isInterviewToday = (interviewDateTime.getDate() == currentDate.getDate() &&
                                interviewDateTime.getMonth() == currentDate.getMonth() &&
                                interviewDateTime.getFullYear() == currentDate.getFullYear());

        if (isInterviewToday) {
            interviewsForToday.push(interviews[idx]);
        }
    };

    res.json(interviewsForToday);
});

// Returns last three recent job shortlists
router.get('/recentShortlists/:email', async (req, res) => {
    let intervieweeEmail = req.params.email;
    // From interviewee email, fetch interviewee ID
    let { id } = await interviewee.findUnique({
        where: {
            email: intervieweeEmail
        },
        select: {
            id: true
        }
    });

    let recentJobShortlists = await jobApplicationHistory.findMany({
        where: {
            intervieweeId: id,
            currentInterviewRound: 1
        },
        select: {
            job: {
                select: {
                    title: true,
                    company: {
                        select: {
                            companyName: true
                        }
                    }
                }
            },
            interviewerMappingDone: true,
            currentInterviewer: {
                select: {
                    calendlyLink: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 3
    })

    res.json(recentJobShortlists);
})

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
    });

    // Update Job Application History Record
    // Set Application Status as ONGOING, as the interviewee is about to be assigned an interviewer
    let updatedJobApplicationHistoryRecord = await jobApplicationHistory.update({
        where: {
            intervieweeId: intervieweeId,
            jobId: jobId
        },
        data: {
            applicationStatus: "ONGOING",
            interviewerMappingDone: true,
            currentInterviewerId: interviewerId
        }
    })

    let newOngoingInterviewRecord = await ongoingInterviewStatus.create({
        data: {
            intervieweeId: intervieweeId,
            jobId: jobId,
            humanResourceId: humanResourceId,
            interviewerId: interviewerId,
            joiningLink: "https://us05web.zoom.us/j/4987381767?pwd=UEM0MkN1aEFHcU9wRFRSaUVnd1gzUT09",
            interviewRoundNumber: currentInterviewRound,
            interviewDateTime: new Date() // TODO: change this logic
        }
    })

    res.json(newOngoingInterviewRecord);
});

router.post('/', async (req, res) => {
    let intervieweeEmail = req.body.email;
    let primaryAndSecondarySkills = ""

    let newIntervieweeRecord = await interviewee.create({
        data: {
            email: intervieweeEmail,
            primaryAndSecondarySkills: primaryAndSecondarySkills
        }
    });

    res.json(newIntervieweeRecord);
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
            currentInterviewRound: 1,
            shortlistedAt: new Date()
        }
    });

    res.json(updatedJobApplication);
});

router.put('/', async (req, res) => {
    let intervieweeEmail = req.body.intervieweeEmail;
    let intervieweeName = req.body.intervieweeName;
    let primarySkills = req.body.primarySkills;
    let secondarySkills = req.body.secondarySkills;
    let companyName = req.body.companyName;
    let resume = req.body.resume;

    let primaryAndSecondarySkills = primarySkills + '#' + secondarySkills;

    let updatedIntervieweeRecord = await interviewee.update({
        where: {
            email: intervieweeEmail
        },
        data: {
            name: intervieweeName,
            primaryAndSecondarySkills: primaryAndSecondarySkills,
            currentCompanyName: companyName,
            resume: resume
        }
    });

    res.json(updatedIntervieweeRecord);
});