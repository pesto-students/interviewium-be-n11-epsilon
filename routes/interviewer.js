const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const res = require('express/lib/response');
const { interviewer, hrInterviewerInviteHistory, humanResource, ongoingInterviewStatus, jobApplicationHistory } = new PrismaClient();

// GET Endpoints
/*
    Returns:
    1. Number of interviews for today
    2. Number of scheduled interviews
    3. Number of interviewers taken by the interviewer, where interviewees
       are awaiting review
*/
router.get('/dashboardMetrics/:email', async (req, res, next) => {
    try {
        // TODO: change from hardcoded data
        let metrics = {}
        metrics["interviewsToday"] = 2;
        metrics["scheduledInterviews"] = 3;
        metrics["waitingForReview"] = 1;
        res.json(metrics);
    } catch (error) {
        next(error);
    }
});

router.get('/today/:email', async (req, res, next) => {
    try {
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
            interviewee: {
                select: {
                    name: true
                }
            },
            interviewDateTime: true,
            joiningLink: true,
            interviewRoundNumber: true
        }
    });

    res.json(allInterviews);
    } catch (error) {
        next(error)
    }
});

router.get('/calendlyLink/:email', async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error)
    }
});

router.get('/feedbacksPending/:email', async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error)
    }
});

/*
    Returns:
    1. Number of interviews taken by the interviewer
    2. Number of candidates passed by the interviewer
*/
router.get('/graph/:email', async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error)
    }
});

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

        let interviewers = await hrInterviewerInviteHistory.findMany({
            where: {
                humanResourceId: id
            },
            include: {
                interviewer: true
            }
        });

        res.json(interviewers);
    } catch (error) {
        next(error)
    }
});

router.get('/profile/:email', async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error)
    }
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
router.get('/interviews/:email', async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error)
    }
});

// POST Endpoints

// PUT
// Set/update Calendly Link
router.put('/calendlyLink/:email', async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error)
    }
});

// Update interview verdict (where inteview is identified
// uniquely by an interviewee ID & job ID)
router.put('/updateVerdictAndReview', async (req, res, next) => {
    try {
        // Fields used to locate JobApplicationHistory & OngoingInterviewStatus record
        // Interviewee ID & Job ID are used to uniquely locate a JobApplicationHistory record
        // Interviewee ID, Job ID & Interview Round Number is used to uniquely locate an OngoingInterviewStatus record
        let intervieweeId = req.body.intervieweeId;
        let jobId = req.body.jobId; 
        let interviewRoundNumber = req.body.interviewRoundNumber;

        // Fields to update in OngoingInterviewStatus
        let interviewerVerdict = req.body.interviewerVerdict; // PASSED, FAILED or UNDECIDED?
        let interviewerReview = req.body.interviewerReview;
        
        // Fetch ongoing interview record ID, from interviewee ID & job ID
        let { id } = await ongoingInterviewStatus.findFirst({
            where: {
                intervieweeId: intervieweeId,
                jobId: jobId,
                interviewRoundNumber: interviewRoundNumber
            },
            select: {
                id: true
            }
        });

        // Update Ongoing Interview Status Record
        let updatedOngoingInterviewRecord = await ongoingInterviewStatus.update({
            where: {
                id: id
            },
            data: {
                interviewerVerdict: interviewerVerdict,
                interviewerReview: interviewerReview
            }
        });

        let jobApplicationHistoryRecord = await jobApplicationHistory.findFirst({
            where: {
                intervieweeId: intervieweeId,
                jobId: jobId
            }
        });
        let jobApplicationHistoryRecordId = jobApplicationHistoryRecord.id;

        // What to do if an interviewer passes the interviewee?
        if (interviewerVerdict == "PASSED") {
            // If current interview round is 4, then the candidate has PASSED all the interviews!
            // Congratulations Mr/Miss Candidate!

            let currentInterviewRound = updatedOngoingInterviewRecord.interviewRoundNumber

            // Note: All interviews in interviewium are set for four rounds
            if (currentInterviewRound == 4) {  
                let updatedJobApplicationHistoryRecord = await jobApplicationHistory.update({
                    where: {
                        id: jobApplicationHistoryRecordId
                    },
                    data: {
                        applicationStatus: "PASSED"
                    }
                });
            } else {
                // The round that the candidate has passed is either 1st/2nd/3rd. We hence advance the candidate to the
                // next round
                // With this, their job application status is again moved back to "WAITING_FOR_INTERVIEWER_ASSIGNMENT" as
                // the candidte needs a new interviewer to take the next round

                // We increase current interview round value by 1
                currentInterviewRound = currentInterviewRound + 1;

                let updatedJobApplicationHistoryRecord = await jobApplicationHistory.update({
                    where: {
                        id: jobApplicationHistoryRecordId
                    },
                    data: {
                        applicationStatus: "WAITING_FOR_INTERVIEWER_ASSIGNMENT",
                        currentInterviewRound: currentInterviewRound,
                        interviewerMappingDone: false
                    }
                });
            }
        };

        // What to do if an interviewer rejects the candidate?
        if (interviewerVerdict == "FAILED") {
            // Move interview progress state to REJECTED in Ongoing Interview Status
            let updatedOngoingInterviewRecord1 = await ongoingInterviewStatus.update({
                where: {
                    id: id
                },
                data: {
                    interviewProgressStatus: "REJECTED"
                }
            });
            updatedOngoingInterviewRecord = updatedOngoingInterviewRecord1;

            // Simply move the candidate's job application status to rejected
            let updatedJobApplicationHistoryRecord = await jobApplicationHistory.update({
                where: {
                    id: jobApplicationHistoryRecordId
                },
                data: {
                    applicationStatus: "REJECTED"
                }
            });
        }

        res.json(updatedOngoingInterviewRecord);
    } catch (error) {
        next(error)
    }
});

module.exports = router;