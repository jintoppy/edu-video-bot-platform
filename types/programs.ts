interface AcademicRequirements {
  // Previous Education
  minimumEducationLevel: {
    level: string; // e.g., "Bachelor's", "Master's", "High School"
    requiredStream?: string[]; // e.g., ["Science", "Commerce", "Arts"]
    specificMajors?: string[]; // e.g., ["Computer Science", "Engineering"]
  };

  // Academic Performance
  minimumGPA: {
    score: number;
    maxScale: number; // e.g., 4.0, 10.0
    convertedPercentage: number;
  };

  // Specific Subject Requirements
  requiredSubjects: {
    subjectName: string;
    minimumGrade: string;
    isCompulsory: boolean;
  }[];

  // Research Requirements (for higher degrees)
  researchRequirements?: {
    publicationsNeeded: boolean;
    minimumPublications?: number;
    researchExperienceYears?: number;
  };
}

interface LanguageRequirements {
  // English Proficiency Tests
  acceptedTests: {
    IELTS?: {
      overallScore: number;
      minimumScores: {
        reading: number;
        writing: number;
        speaking: number;
        listening: number;
      };
    };
    TOEFL?: {
      overallScore: number;
      minimumScores: {
        reading: number;
        writing: number;
        speaking: number;
        listening: number;
      };
    };
    PTE?: {
      overallScore: number;
      minimumScores: {
        reading: number;
        writing: number;
        speaking: number;
        listening: number;
      };
    };
    Duolingo?: {
      minimumScore: number;
    };
  };

  // Exemptions
  exemptionCriteria?: {
    nativeEnglishCountries: string[];
    englishMediumEducation: {
      yearsRequired: number;
      proofRequired: boolean;
    };
  };
}

interface ProfessionalRequirements {
  workExperience: {
    yearsRequired: number;
    isCompulsory: boolean;
    relevantFieldsOnly: boolean;
    acceptedFields?: string[];
  };

  // Professional Certifications
  certifications: {
    name: string;
    isCompulsory: boolean;
    alternativesAccepted: string[];
  }[];
}

interface StandardizedTestRequirements {
  // Graduate Tests
  GRE?: {
    required: boolean;
    minimumScores: {
      verbal: number;
      quantitative: number;
      analyticalWriting: number;
      total?: number;
    };
  };

  GMAT?: {
    required: boolean;
    minimumScores: {
      verbal: number;
      quantitative: number;
      analyticalWriting: number;
      integratedReasoning: number;
      total: number;
    };
  };

  // Subject-Specific Tests
  subjectTests?: {
    testName: string;
    minimumScore: number;
    isCompulsory: boolean;
  }[];
}

interface AdditionalRequirements {
  // Age Requirements
  ageLimit?: {
    minimum: number;
    maximum?: number;
  };

  // Financial Requirements
  financialRequirements: {
    proofOfFunds: boolean;
    minimumAmount: number;
    currency: string;
    durationInMonths: number;
  };

  // Portfolio Requirements
  portfolioRequirements?: {
    required: boolean;
    type: string[]; // e.g., ["Art Samples", "Design Projects"]
    minimumItems: number;
  };

  // Interview Requirements
  interviewRequired?: {
    required: boolean;
    type: string; // "Online", "In-person", "Either"
  };

  // Letter of Recommendation
  recommendationLetters?: {
    required: boolean;
    minimum: number;
    academic: number;
    professional: number;
  };
}

interface SpecialConditions {
  countrySpecificRequirements?: {
    country: string;
    additionalDocuments: string[];
    specialConditions: string[];
  }[];

  quotaReservations?: {
    category: string;
    percentageReserved: number;
    specialCriteria: string[];
  }[];

  scholarshipEligibility?: {
    available: boolean;
    criteria: string[];
    amount?: number;
    currency?: string;
  }[];
}

// Program Eligibility Form Component
export interface ProgramEligibilityForm {
  // Basic Program Info
  programInfo: {
    name: string;
    level: string;
    department: string;
    duration: string;
    intake: string[];
  };

  // All Eligibility Criteria
  eligibilityCriteria: {
    academic: AcademicRequirements;
    language: LanguageRequirements;
    professional?: ProfessionalRequirements;
    standardizedTests?: StandardizedTestRequirements;
    additional: AdditionalRequirements;
    specialConditions?: SpecialConditions;
  };
}

