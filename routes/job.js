const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const res = require('express/lib/response');
const { route } = require('./interviewer');
const { job, jobApplicationHistory, interviewee, hrJobPostHistory, humanResource } = new PrismaClient();

// GET API Endpoints
router.get('/', async (req, res, next) => {
    try {
        let { primarySkills, secondarySkills, employmentType, experience, intervieweeEmail } = req.query;

        if (experience) {
            experience = parseInt(experience);
        }

        // From interviewee email, fetch interviewee ID
        let id;
        try {
            let { id } = await interviewee.findUnique({
                where: {
                    email: intervieweeEmail
                },
                select: {
                    id: true
                }
            });
            id = id;
        } catch (error) {
            intervieweeEmail = null
        }
        
        
        let filteredJobs;
        if (primarySkills) {
            primarySkills = primarySkills.toLowerCase();
            let primarySkillsArr;
            primarySkillsArr = primarySkills.trim().split(',');

            if (primarySkillsArr.length == 1) { // Frontend has only sent 1 primary skill
                let firstPrimarySkill = primarySkillsArr[0];
            
                filteredJobs = await job.findMany({
                    where: {
                        primaryAndSecondarySkills: {
                            contains: firstPrimarySkill
                        },
                        employmentType: employmentType,
                        minExperienceInYears: {
                            lte: experience
                        },
                        maxExperienceInYears: {
                            gte: experience
                        }
                    },
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
                        jobDescription: true,
                        employmentType: true
                    }
                });
            }

            if (primarySkillsArr.length == 2) { // Frontend has sent two primary skills
                let firstPrimarySkill = primarySkillsArr[0];
                let secondPrimarySkill = primarySkillsArr[1];
            
                filteredJobs = await job.findMany({
                    where: {
                            OR: [
                                {
                                    primaryAndSecondarySkills: {
                                        contains: firstPrimarySkill
                                    }
                                },
                                {
                                    primaryAndSecondarySkills: {
                                        contains: secondPrimarySkill
                                    }
                                }
                            ],
                            employmentType: employmentType,
                            minExperienceInYears: {
                                lte: experience
                            },
                            maxExperienceInYears: {
                                gte: experience
                            }
                        },
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
                            jobDescription: true,
                            employmentType: true
                        }
                    }
                );
            }
        } else if (secondarySkills) {
            secondarySkills = secondarySkills.toLowerCase();
            let secondarySkillsArr;
            secondarySkillsArr = secondarySkills.trim().split(',');

            if (secondarySkillsArr.length == 1) { // Frontend has only sent 1 secondary skill
                let firstSecondarySkill = secondarySkillsArr[0];
            
                filteredJobs = await job.findMany({
                    where: {
                        primaryAndSecondarySkills: {
                            contains: firstSecondarySkill
                        },
                        employmentType: employmentType,
                        minExperienceInYears: {
                            lte: experience
                        },
                        maxExperienceInYears: {
                            gte: experience
                        }
                    },
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
                        jobDescription: true,
                        employmentType: true
                    }
                });
            }

            if (secondarySkillsArr.length == 2) { // Frontend has sent two secondary skills
                let firstSecondarySkill = secondarySkillsArr[0];
                let secondSecondarySkill = secondarySkillsArr[1]
            
                filteredJobs = await job.findMany({
                    where: {
                            OR: [
                                {
                                    primaryAndSecondarySkills: {
                                        contains: firstSecondarySkill
                                    }
                                },
                                {
                                    primaryAndSecondarySkills: {
                                        contains: secondSecondarySkill
                                    }
                                }
                            ],
                            employmentType: employmentType,
                            minExperienceInYears: {
                                lte: experience
                            },
                            maxExperienceInYears: {
                                gte: experience
                            }
                        },
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
                            jobDescription: true,
                            employmentType: true
                        }
                    }
                );
            }
        } else {
            filteredJobs = await job.findMany({
                where: {
                    employmentType: employmentType,
                    minExperienceInYears: {
                        lte: experience
                    },
                    maxExperienceInYears: {
                        gte: experience
                    }
                },
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
                    jobDescription: true,
                    employmentType: true
                }
            });
        }

        if (intervieweeEmail) {
            let allJobsAppliedByInterviewee = await jobApplicationHistory.findMany({
                where: {
                    intervieweeId: id
                },
                select: {
                    jobId: true
                }
            });

            allJobsAppliedByIntervieweeArray = [];
            for (let idx = 0; idx < allJobsAppliedByInterviewee.length; idx++) {
                allJobsAppliedByIntervieweeArray.push(allJobsAppliedByInterviewee[idx].jobId);
            }

            let finalFilteredJobs = [];

            for(let idx = 0; idx < filteredJobs.length; idx++) {
                let jobId = filteredJobs[idx].id;

                if (!allJobsAppliedByIntervieweeArray.includes(jobId)) {
                    finalFilteredJobs.push(filteredJobs[idx]);
                }
            }

            res.json(finalFilteredJobs);
        } else {
            res.json(filteredJobs);
        }
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