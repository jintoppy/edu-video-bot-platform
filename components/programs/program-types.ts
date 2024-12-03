import { z } from "zod";

export const programFormSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  level: z.enum(["bachelors", "masters", "phd"]),
  duration: z.string().min(1, "Duration is required"),
  tuitionFee: z.number().min(0, "Tuition fee must be positive"),
  currency: z.enum(["USD", "EUR", "GBP"]),
  country: z.string().min(1, "Country is required"),
  description: z.string().optional(),
  eligibilityCriteria: z.object({
    academic: z.object({
      minimumEducationLevel: z.object({
        level: z.string().optional(),
        requiredStream: z.array(z.string()).optional(),
        specificMajors: z.array(z.string()).optional()
      }).optional(),
      minimumGPA: z.object({
        score: z.number().nullable().optional(),
        maxScale: z.number().nullable().optional(),
        convertedPercentage: z.number().nullable().optional()
      }).optional(),
      requiredSubjects: z.array(z.object({
        subjectName: z.string().optional(),
        minimumGrade: z.string().optional(),
        isCompulsory: z.boolean().optional()
      })).optional()
    }).optional(),
    language: z.object({
      acceptedTests: z.object({
        IELTS: z.object({
          overallScore: z.number().nullable().optional(),
          minimumScores: z.object({
            reading: z.preprocess((val) => (val === '' || isNaN(Number(val)) ? null : Number(val)), z.number().nullable()),
            writing: z.preprocess((val) => (val === '' || isNaN(Number(val)) ? null : Number(val)), z.number().nullable()),
            speaking: z.preprocess((val) => (val === '' || isNaN(Number(val)) ? null : Number(val)), z.number().nullable()),
            listening: z.preprocess((val) => (val === '' || isNaN(Number(val)) ? null : Number(val)), z.number().nullable())
          }).nullable().optional()
        }).optional(),
        TOEFL: z.object({
          overallScore: z.number().optional(),
          minimumScores: z.object({
            reading: z.number().nullable().optional(),
            writing: z.number().nullable().optional(),
            speaking: z.number().nullable().optional(),
            listening: z.number().nullable().optional()
          }).nullable().optional()
        }).optional()
      }).optional()
    }).optional(),
    professional: z.object({
      workExperience: z.object({
        yearsRequired: z.number().nullable().optional(),
        isCompulsory: z.boolean().nullable().optional(),
        relevantFieldsOnly: z.boolean().nullable().optional(),
        acceptedFields: z.array(z.string()).optional()
      }).nullable().optional(),
      certifications: z.array(z.object({
        name: z.string().optional(),
        isCompulsory: z.boolean().optional(),
        alternativesAccepted: z.array(z.string()).optional()
      })).optional()
    }).optional(),
    standardizedTests: z.object({
      GRE: z.object({
        required: z.boolean().nullable().optional(),
        minimumScores: z.object({
          verbal: z.number().nullable().optional(),
          quantitative: z.number().nullable().optional(),
          analyticalWriting: z.number().nullable().optional(),
          total: z.number().nullable().optional()
        }).nullable().optional()
      }).optional(),
      GMAT: z.object({
        required: z.boolean().optional(),
        minimumScores: z.object({
          verbal: z.number().nullable().optional(),
          quantitative: z.number().nullable().optional(),
          analyticalWriting: z.number().nullable().optional(),
          integratedReasoning: z.number().nullable().optional(),
          total: z.number().nullable().optional()
        }).nullable().optional()
      }).optional(),
      subjectTests: z.array(z.object({
        testName: z.string().nullable().optional(),
        minimumScore: z.number().nullable().optional(),
        isCompulsory: z.boolean().nullable().optional()
      })).nullable().optional()
    }).optional(),
    additional: z.object({
      ageLimit: z.object({
        minimum: z.number().nullable().optional(),
        maximum: z.number().nullable().optional()
      }).optional(),
      financialRequirements: z.object({
        proofOfFunds: z.boolean().nullable().optional(),
        minimumAmount: z.number().nullable().optional(),
        currency: z.string().nullable().optional(),
        durationInMonths: z.number().nullable().optional()
      }).nullable().optional(),
      portfolioRequirements: z.object({
        required: z.boolean().nullable().optional(),
        type: z.array(z.string()),
        minimumItems: z.number().nullable().optional()
      }).nullable().optional(),
      interviewRequired: z.object({
        required: z.boolean().nullable().optional(),
        type: z.string().nullable().optional()
      }).nullable().optional(),
      recommendationLetters: z.object({
        required: z.boolean().nullable().optional(),
        minimum: z.number().nullable().optional(),
        academic: z.number().nullable().optional(),
        professional: z.number().nullable().optional()
      }).nullable().optional()
    }).optional(),
    specialConditions: z.object({
      countrySpecificRequirements: z.array(z.object({
        additionalDocuments: z.string(),
      })).nullable().optional(),
      quotaReservations: z.array(z.object({
        category: z.string().nullable().optional(),
        percentageReserved: z.number().nullable().optional(),
        specialCriteria: z.array(z.string())
      })).optional(),
      scholarshipEligibility: z.array(z.object({
        available: z.boolean().nullable().optional(),
        criteria: z.array(z.string()),
        amount: z.number().nullable().optional(),
        currency: z.string().nullable().optional()
      })).optional()
    }).nullable().optional()
  }).optional()
});

export type ProgramFormValues = z.infer<typeof programFormSchema>;
