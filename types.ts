
export interface Biomarkers {
  age: number;
  hbA1c: number;
  rdw: number;
  sbp: number;
  dbp: number; // needed for Pulse Pressure
  creatinine: number;
  lymphocytePercent: number;
  mcv: number;
  pulseRate: number;
  ua: number; // Uric Acid
  crp: number; // C-reactive protein
  wc: number; // Waist Circumference
  bun: number; // Urea Nitrogen
}

export interface CalculationResult {
  chronologicalAge: number;
  predictedAge: number;
  ageGap: number;
  status: 'optimal' | 'average' | 'at-risk';
}

export interface Insight {
  summary: string;
  recommendations: string[];
  riskAnalysis: string;
}
