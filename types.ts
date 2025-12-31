
export enum SessionMode {
  IDLE = 'IDLE',
  LIVE_RECORDING = 'LIVE_RECORDING',
  UPLOAD = 'UPLOAD',
  MANUAL = 'MANUAL',
  ROLEPLAY = 'ROLEPLAY',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED'
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface ClinicalEntity {
  category: 'Medication' | 'Symptom' | 'Vital' | 'History' | 'Condition';
  value: string;
}

export interface StudentEvaluation {
  empathyScore: number;
  professionalismScore: number;
  clinicalAccuracyScore: number;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
}

export interface MedicalReport {
  patientId: string;
  timestamp: string;
  summaryHeading: string;
  detailedSummary: string;
  soap: SOAPNote;
  entities: ClinicalEntity[];
  keyInsights: string[];
  sentiment: 'Positive' | 'Neutral' | 'Concerned' | 'Urgent';
  suggestedFollowUps: string[];
  questionAnswers: QuestionAnswer[];
  evaluation: StudentEvaluation;
  fullTranscript?: string;
}

export interface TranscriptionSegment {
  speaker: 'Student' | 'Patient';
  text: string;
}
