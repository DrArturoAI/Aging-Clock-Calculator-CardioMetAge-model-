
import { Biomarkers } from './types';

export const FORMULA_COEFFICIENTS = {
  AGE: 0.831320,
  HBA1C_LOG: 19.5734,
  RDW: 1.77394,
  SBP: 0.0760217,
  CREATININE: 6.18803,
  LYMPHOCYTE: -0.148076,
  MCV: 0.218946,
  PULSE: 0.105980,
  PP: 0.0603608, // Pulse Pressure
  UA: 0.636711, // Uric Acid
  CRP_LOG: 2.40001,
  WC: 0.0283277,
  BUN: 0.0754119,
  INTERCEPT: -101.454
};

export const INITIAL_BIOMARKERS: Biomarkers = {
  age: 40,
  hbA1c: 5.2,
  rdw: 13.0,
  sbp: 120,
  dbp: 80,
  creatinine: 0.9,
  lymphocytePercent: 30,
  mcv: 90,
  pulseRate: 70,
  ua: 5.0,
  crp: 1.5,
  wc: 90,
  bun: 15
};

export const FIELD_LABELS: Record<keyof Biomarkers, { label: string; unit: string; description: string; category: string }> = {
  age: { label: 'Age', unit: 'years', description: 'Your current chronological age.', category: 'Personal' },
  hbA1c: { label: 'HbA1c', unit: '%', description: 'Glycated hemoglobin (3-month average blood sugar).', category: 'Metabolic' },
  rdw: { label: 'RDW', unit: '%', description: 'Red cell distribution width.', category: 'Blood' },
  sbp: { label: 'Systolic BP', unit: 'mmHg', description: 'Top number of blood pressure reading.', category: 'Cardiovascular' },
  dbp: { label: 'Diastolic BP', unit: 'mmHg', description: 'Bottom number of blood pressure reading.', category: 'Cardiovascular' },
  creatinine: { label: 'Creatinine', unit: 'mg/dL', description: 'Kidney function marker.', category: 'Renal' },
  lymphocytePercent: { label: 'Lymphocyte %', unit: '%', description: 'Percentage of white blood cells.', category: 'Immune' },
  mcv: { label: 'MCV', unit: 'fL', description: 'Mean corpuscular volume (average red cell size).', category: 'Blood' },
  pulseRate: { label: 'Pulse Rate', unit: 'bpm', description: 'Resting heart rate.', category: 'Cardiovascular' },
  ua: { label: 'Uric Acid', unit: 'mg/dL', description: 'Byproduct of purine metabolism.', category: 'Metabolic' },
  crp: { label: 'CRP', unit: 'mg/L', description: 'C-reactive protein (inflammation marker).', category: 'Immune' },
  wc: { label: 'Waist Circ.', unit: 'cm', description: 'Waist circumference at the navel.', category: 'Metabolic' },
  bun: { label: 'BUN', unit: 'mg/dL', description: 'Blood urea nitrogen (kidney/liver function).', category: 'Renal' }
};
