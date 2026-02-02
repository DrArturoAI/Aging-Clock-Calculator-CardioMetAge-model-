
import { GoogleGenAI, Type } from "@google/genai";
import { Biomarkers, CalculationResult, Insight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHealthInsights = async (biomarkers: Biomarkers, result: CalculationResult): Promise<Insight> => {
  const prompt = `
    Analyze the following cardiometabolic data:
    Chronological Age: ${result.chronologicalAge}
    Predicted CardioMetAge: ${result.predictedAge.toFixed(1)}
    Age Gap: ${result.ageGap.toFixed(1)} years

    Biomarkers provided:
    - HbA1c: ${biomarkers.hbA1c}%
    - Creatinine: ${biomarkers.creatinine} mg/dL
    - CRP (Inflammation): ${biomarkers.crp} mg/L
    - SBP/DBP: ${biomarkers.sbp}/${biomarkers.dbp} mmHg
    - Waist Circumference: ${biomarkers.wc} cm
    - BUN: ${biomarkers.bun} mg/dL
    - Lymphocyte %: ${biomarkers.lymphocytePercent}%
    - Pulse: ${biomarkers.pulseRate} bpm

    The CardioMetAge is a measure of biological aging related to cardiometabolic health. 
    Provide a professional summary, risk analysis, and 3 actionable recommendations to improve these biomarkers.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          riskAnalysis: { type: Type.STRING }
        },
        required: ['summary', 'recommendations', 'riskAnalysis']
      }
    }
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as Insight;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return {
      summary: "Based on the input data, your CardioMetAge suggests your biological system is aging relative to your chronological age.",
      riskAnalysis: "Elevated biomarkers like HbA1c and CRP are major contributors to cardiometabolic aging.",
      recommendations: [
        "Consult with a healthcare provider regarding blood glucose and inflammation markers.",
        "Maintain a healthy weight and waist circumference through balanced nutrition.",
        "Engage in regular cardiovascular exercise to improve heart rate and blood pressure."
      ]
    };
  }
};
