const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const res = require('express/lib/response');
const { humanResource, jobApplicationHistory, hrJobPostHistory, job, interviewee, company,
        location, hrInterviewerInviteHistory, interviewer, ongoingInterviewStatus,
        hrIntervieweeInviteHistory } = new PrismaClient();

// GET Endpoints
router.get('/', async (req, res, next) => {
    try {
        let humanResources = await humanResource.findMany({});

        res.json(humanResources);
    } catch (error) {
        next(error)
    }
})

router.get('/:email', async (req, res, next) => {
    try {
        const email = req.params.email;
        let uniqueHumanResource = await humanResource.findUnique({
            where: {
                email: email
            }
        });

        res.json(uniqueHumanResource);
    } catch (error) {
        next(error)
    }
})

/*
    Returns:
    1. Number of job applications received across all jobs posted by HR
    2. Number of ongoing interviews across all jobs posted by HR
    3. Number of candidates hired across all jobs posted by HR
*/
router.get('/dashboardHeader/:email', async (req, res, next) => {
    try {
        let humanResourceEmail = req.params.email

        // From Human Resource email, fetch human resource ID
        let { id } = await humanResource.findUnique({
            select: {
                id: true
            },
            where: {
                email: humanResourceEmail
            }
        })
        
        let dashboardMetrics = {};

        // Number of job applications received across all jobs posted by HR
        let numberOfJobApplications = await jobApplicationHistory.count({
            where: {
                humanResourceId: id
            }
        })
        dashboardMetrics["numberOfJobApplications"] = numberOfJobApplications;

        // Number of ongoing interviews across all jobs posted by HR
        let numberOfOngoingInterviews = await jobApplicationHistory.count({
            where: {
                humanResourceId: id,
                OR: [
                    {
                        applicationStatus: "ONGOING"
                    },
                    {
                        applicationStatus: "PASSED"
                    },
                    {
                        applicationStatus: "WAITING_FOR_INTERVIEWER_ASSIGNMENT"
                    }
                ]
            }
        });
        dashboardMetrics["numberOfOngoingInterviews"] = numberOfOngoingInterviews;

        // Number of candidates hired across all jobs posted by HR
        let numberOfCandidatesHired = await jobApplicationHistory.count({
            where: {
                humanResourceId: id,
                applicationStatus: "ACCEPTED"
            }
        });
        dashboardMetrics["numberOfCandidatesHired"] = numberOfCandidatesHired;

        res.json(dashboardMetrics);
    } catch (error) {
        next(error)
    }
});

router.get('/invitedInterviewees/:email', async (req, res, next) => {
    try {
        let humanResourceEmail = req.params.email;

        // From Human Resource email, fetch human resource ID
        let { id } = await humanResource.findUnique({
            select: {
                id: true
            },
            where: {
                email: humanResourceEmail
            }
        });

        let invitedInterviewees = await hrIntervieweeInviteHistory.findMany({
            where: {
                humanResourceId: id
            },
            select: {
                interviewee: {
                    select: {
                        name: true,
                        email: true,
                        yearsOfExperience: true,
                        mobileNumber: true,
                        linkedinProfileLink: true,
                        currentCompanyName: true,
                        resumeLink: true
                    }
                },
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

        res.json(invitedInterviewees);
    } catch (error) {
        next(error);
    }
});

/*
    Returns last three job postings done by the HR
    Fields returned for each job:
    1. Job Title
    2. Job Posting Date
    3. Number of applications received for this job
*/
router.get('/recentJobPostings/:email', async (req, res, next) => {
    try {
        let humanResourceEmail = req.params.email;

        // From Human Resource email, fetch human resource ID
        let { id } = await humanResource.findUnique({
            select: {
                id: true
            },
            where: {
                email: humanResourceEmail
            }
        });
        
        let lastThreeJobPostingIds = await hrJobPostHistory.findMany({
            where: {
                humanResourceId: id
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                jobId: true
            },
            take: 3
        });

        let finalQueryResult = [];
        for(let idx = 0; idx < lastThreeJobPostingIds.length; idx++) {
            let jobPostingId = lastThreeJobPostingIds[idx].jobId;
            let singleQueryResult = {};
            let numberOfJobApplicationsReceived = await jobApplicationHistory.count({
                where: {
                    jobId: jobPostingId
                }
            });
            singleQueryResult["numberOfJobApplicationsReceived"] = numberOfJobApplicationsReceived;

            let { title, createdAt } = await job.findFirst({
                where: {
                    id: jobPostingId
                },
                select: {
                    title: true,
                    createdAt: true
                }
            });
            singleQueryResult["title"] = title;
            singleQueryResult["postedAt"] = createdAt;

            finalQueryResult.push(singleQueryResult);
        }

        res.json(finalQueryResult);
    } catch (error) {
        next(error)
    }
});

/*
    Returns:
    1. Number of candidates offered across all jobs posted by HR
    2. Number of candidates hired across all jobs posted by HR
*/
router.get('/graph/:email', async (req, res, next) => {
    try {
        let humanResourceEmail = req.params.email;
        // From Human Resource email, fetch human resource ID
        let { id } = await humanResource.findUnique({
            select: {
                id: true
            },
            where: {
                email: humanResourceEmail
            }
        });

        let finalQueryResult = {}
        // Number of candidates offered (cleared all interviews)
        let numberOfCandidatesOffered = await jobApplicationHistory.count({
            where: {
                humanResourceId: id,
                applicationStatus: "PASSED"
            }
        });
        finalQueryResult["numberOfCandidatesOffered"] = numberOfCandidatesOffered;

        // Number of candidates hired (accepted the extended offer)
        let numberOfCandidatesHired = await jobApplicationHistory.count({
            where: {
                humanResourceId: id,
                applicationStatus: "ACCEPTED"
            }
        });
        finalQueryResult["numberOfCandidatesHired"] = numberOfCandidatesHired;

        return res.json(finalQueryResult);
    } catch (error) {
        next(error)
    }
});

/*
    Returns latest seven job applicants
    Fields returned:
    1. Job Applicant Name
    2. Job Applicant Experience Level (in years)
    3. Job Applicant's Skills
    4. Job Title &
    5. Job Company
*/
router.get('/recentJobApplicants/:email', async (req, res, next) => {
    try {
        let humanResourceEmail = req.params.email;
        // From Human Resource email, fetch human resource ID
        let { id } = await humanResource.findUnique({
        select: {
            id: true
        },
        where: {
            email: humanResourceEmail
        }
    });

    let recentJobApplicantsData = await jobApplicationHistory.findMany({
        where: {
            humanResourceId: id
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 7,
        select: {
            jobId: true,
            intervieweeId: true
        }
    });

   let finalQueryResult = [];
   for(let idx = 0; idx < recentJobApplicantsData.length; idx++){
       let intervieweeId = recentJobApplicantsData[idx].intervieweeId;
       let jobId = recentJobApplicantsData[idx].jobId;
       let singleQueryResult = {};

       // Get job applicant's (interviewee's) name, experience level & skills
        let { name, yearsOfExperience, primaryAndSecondarySkills } = await interviewee.findFirst({
            where: {
                id: intervieweeId
            },
            select: {
                name: true,
                yearsOfExperience: true,
                primaryAndSecondarySkills: true
            }
        });
        singleQueryResult["name"] = name;
        singleQueryResult["yearsOfExperience"] = yearsOfExperience;
        singleQueryResult["primaryAndSecondarySkills"] = primaryAndSecondarySkills; 

        // Get Job Title & Company name
        let { title, company: { companyName } } = await job.findFirst({
            where: {
                id: jobId
            },
            include: {
                company: {
                    select: {
                        companyName: true
                    }
                }
            }
        });
        singleQueryResult["title"] = title;
        singleQueryResult["companyName"] = companyName;

        finalQueryResult.push(singleQueryResult);
   }

    res.json(finalQueryResult);
    } catch (error) {
        next(error)
    }
})

// Returns a list of all interviewers onboarded by the HR
router.get("/interviewers/:email", async (req, res, next) => {
    try {
        let humanResourceEmail = req.params.email;
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

/*
    Returns a list of "ongoing interviews" for the HR [interviews
    for which the status is either Ongoing OR Passed OR
    Waiting For Interviewer Assignment]
*/
router.get('/ongoingInterviews/:email', async (req, res, next) => {
    try {
        let humanResourceEmail = req.params.email;
        // From Human Resource email, fetch human resource ID
        let { id } = await humanResource.findUnique({
        where: {
            email: humanResourceEmail
        },
        select: {
            id: true
        }
    });

    let ongoingInterviews = await ongoingInterviewStatus.findMany({
        where: {
            humanResourceId: id,
            interviewProgressStatus: "IN_PROGRESS"
        },
        select: {
            id: true,
            interviewee: {
                select: {
                        id: true,
                        name: true,
                        email: true
                }
            },
            interviewer: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            interviewRoundNumber: true,
            interviewerVerdict: true,
            interviewDateTime: true
        }
    });

    res.json(ongoingInterviews);
    } catch (error) {
        next(error)
    }
})

/*
    Returns a list of "previous interviews" for the HR [interviews
    for which the status is either Accepted OR Rejected]
*/
router.get('/previousInterviews/:email', async (req, res, next) => {
    try {
        let humanResourceEmail = req.params.email;
    // From Human Resource email, fetch human resource ID
    let { id } = await humanResource.findUnique({
       select: {
           id: true
       },
       where: {
           email: humanResourceEmail
       }
   });

   let previousInterviews = await ongoingInterviewStatus.findMany({
       where: {
           humanResourceId: id,
           OR: [
               {
                   interviewProgressStatus: "ACCEPTED"
               },
               {
                   interviewProgressStatus: "REJECTED"
               }
           ]
       },
       select: {
            id: true,
            interviewee: {
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            },
            interviewer: {
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            },
            interviewProgressStatus: true, // Used to find Hire Status
            interviewDateTime: true
       }
   });

   res.json(previousInterviews);
    } catch (error) {
        next(error)
    }
})

// Returns all interviewees who applied across all jobs, posted by HR
router.get('/applicants/:email', async (req, res, next) => {
    try {
        let humanResourceEmail = req.params.email;
        // From Human Resource email, fetch human resource ID
        let { id } = await humanResource.findUnique({
            select: {
                id: true
            },
            where: {
                email: humanResourceEmail
            }
        });

        // Get a list of IDs of all jobs posted by HR
        let applicantsToJobsPostedByHR = await jobApplicationHistory.findMany({
            where: {
                humanResourceId: id,
                applicationStatus: "APPLIED"
            },
            select: {
                interviewee: {
                    select: {
                        id: true,
                        name: true,
                        yearsOfExperience: true,
                        primaryAndSecondarySkills: true
                    }
                },
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

        res.json(applicantsToJobsPostedByHR);
    } catch (error) {
        next(error)
    }
});

// POST Endpoints
// Creates a new Human Resource in our system
router.post("/", async (req, res, next) => {
    try {
        let humanResourceEmail = req.body.email;

        let createdHumanResource = await humanResource.create({
            data: {
                email: humanResourceEmail,
                companyId: "ckyjcs02n1616ioi5oa39ocn4" // All HRs are currently tagged to Test Interviewium Company
            }
        });
    
        res.json(createdHumanResource);
    } catch (error) {
        next(error)
    }
});

// Creates a new job posting
router.post('/job', async (req, res, next) => {
    try {
        let jobTitle = req.body.jobTitle;
        let companyName = req.body.companyName;
        let cityName = req.body.cityName;
        let employmentType = req.body.employmentType;
        let jobDescription = req.body.jobDescription;
        let primarySkills = req.body.primarySkills;
        let secondarySkills = req.body.secondarySkills;
        let humanResourceEmail = req.body.humanResourceEmail;

        // From Human Resource email, fetch human resource ID
        let { id } = await humanResource.findUnique({
            select: {
                id: true
            },
            where: {
                email: humanResourceEmail
            }
        });

        // From company Name, fetch company ID
        // If there is no company by this name, create one
        let companyObj = await company.findUnique({
            select: {
                id: true
            },
            where: {
                companyName: companyName
            }
        });
        if (!companyObj) {
            companyObj = await company.create({
                data: {
                    companyName: companyName
                }
            })
        };
        let companyId = companyObj.id;

        // From city name, fetch location ID
        // If there's no city by this name create one
        let locationObj = await location.findFirst({
            select: {
                id: true
            },
            where: {
                city: cityName
            }
        });
        if (!locationObj) {
            locationObj = await location.create({
                data: {
                    city: cityName,
                    country: ''
                }
            })
        };
        let locationId = locationObj.id;

        let primaryAndSecondarySkills = primarySkills + "^" + secondarySkills;

        let newJobPost = await job.create({
            data: {
                title: jobTitle,
                humanResourceId: id,
                employmentType: employmentType,
                jobDescription: jobDescription,
                companyId: companyId,
                locationId: locationId,
                primaryAndSecondarySkills: primaryAndSecondarySkills
            }
        });

       if (newJobPost) {
            let jobId = newJobPost.id;

            // Create a new record in HrJobPostHistory table
            let hrJobPostHistoryRecord = await hrJobPostHistory.create({
                data: {
                    humanResourceId: id,
                    jobId: jobId
                }
            });
       }

        res.json(newJobPost);
    } catch (error) {
        next(error)
    }
})

// Create an interviewer invite record
router.post('/inviteInterviewer', async (req, res, next) => {
    try {
        let humanResourceEmail = req.body.email;
        // From Human Resource email, fetch human resource ID
        let { id } = await humanResource.findUnique({
            select: {
                id: true
            },
            where: {
                email: humanResourceEmail
            }
        });
    
        let interviewerEmail = req.body.interviewerEmail;
    
        let interviewerRecord = await interviewer.create({
            data: {
                email: interviewerEmail,
                companyId: "ckyjcs02n1616ioi5oa39ocn4",
                interviewerProfileImageS3Link: "https://picsum.photos/200/300"
            }
        })
        let interviewerRecordId = interviewerRecord.id;
    
        let hrInterviewerInviteHistoryRecord = await hrInterviewerInviteHistory.create({
            data: {
                humanResourceId: id,
                interviewerId: interviewerRecordId
            }
        })
    
        res.json(interviewerRecord);
    } catch (error) {
        next(error)
    }
})

router.post('/inviteInterviewee', async (req, res, next) => {
    try {
        let humanResourceEmail = req.body.email;
        let intervieweeId = req.body.intervieweeId;
        let jobId = req.body.jobId;

        // From Human Resource email, fetch human resource ID
        let { id } = await humanResource.findUnique({
            select: {
                id: true
            },
            where: {
                email: humanResourceEmail
            }
        });

        let hrIntervieweeInviteRecord = await hrIntervieweeInviteHistory.create({
            data: {
                humanResourceId: id,
                intervieweeId: intervieweeId,
                jobId: jobId
            }
        });

        res.json(hrIntervieweeInviteRecord);
    } catch (error) {
        next(error);
    }
});

module.exports = router