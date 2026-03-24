import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PrescriptionData {
  id: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  isAcute: boolean;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Validated' | 'Prioritized' | 'Dispensed';
  validationErrors: string[];
  clinicalNotes: string[];
  labelInstructions: string;
  receivedAt: Date;
  processedAt?: Date;
}

export async function processPrescription(text: string): Promise<Partial<PrescriptionData>> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract prescription details from this text and perform clinical validation. 
    Text: "${text}"
    
    Identify:
    1. Patient Name
    2. Medication Name
    3. Dosage and Frequency
    4. Is it an acute medication? (e.g. antibiotics, pain relief for immediate use)
    5. Priority (High if acute or urgent, Medium otherwise)
    6. Potential errors or clinical warnings (e.g. drug interactions, unusual dosage)
    7. Intelligent labeling instructions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          patientName: { type: Type.STRING },
          medication: { type: Type.STRING },
          dosage: { type: Type.STRING },
          frequency: { type: Type.STRING },
          isAcute: { type: Type.BOOLEAN },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          validationErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
          clinicalNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
          labelInstructions: { type: Type.STRING }
        },
        required: ["patientName", "medication", "dosage", "frequency", "isAcute", "priority"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  return {
    ...result,
    id: Math.random().toString(36).substr(2, 9),
    status: 'Pending',
    receivedAt: new Date()
  };
}

export async function validatePrescription(sourceData: string, columbusData: any, isImage: boolean = false): Promise<{ passed: boolean; discrepancies: string[]; reasoning: string; confidence: number }> {
  const prompt = `You are a Senior Clinical Pharmacist performing a high-stakes safety check. 
  Compare the ORIGINAL prescription source with the extracted data in the Columbus pharmacy system.
  
  ${isImage ? "SOURCE: Scanned Prescription Image (attached)" : `SOURCE: EPS Message: "${sourceData}"`}
  COLUMBUS SYSTEM DATA: ${JSON.stringify(columbusData)}
  
  VALIDATION RULES:
  1. DO NOT perform simple string matching. Use clinical intelligence.
  2. "1 tab", "one tablet", and "1 tablet" are identical.
  3. "TID", "Three times daily", and "3 times a day" are identical.
  4. If the original says "one capsule" and the drug strength is 500mg, then "500mg" in Columbus is CORRECT.
  5. If the original says "one capsule" (500mg) but Columbus says "250mg", this is a CRITICAL DOSAGE ERROR.
  6. Check for: Patient Name, Medication, Dosage, Frequency, Quantity, Prescriber, and Dates.
  7. If any clinical meaning differs (e.g. wrong dose, wrong frequency, wrong patient), set passed to false.
  
  Provide a list of discrepancies and a brief clinical reasoning for your decision.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: isImage ? [
      { text: prompt },
      { inlineData: { 
          mimeType: "image/png", 
          data: sourceData.includes('base64,') ? sourceData.split('base64,')[1] : sourceData 
        } 
      }
    ] : prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          passed: { type: Type.BOOLEAN },
          discrepancies: { type: Type.ARRAY, items: { type: Type.STRING } },
          reasoning: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ["passed", "discrepancies", "reasoning", "confidence"]
      }
    }
  });

  return JSON.parse(response.text || '{"passed": false, "discrepancies": ["Validation failed to run"], "reasoning": "Internal error", "confidence": 0}');
}

export async function getClinicalRecommendation(patientContext: any, currentRx: any): Promise<{
  summary: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  actionPlan: 'STOP' | 'COUNSEL' | 'PROCEED';
  interactions: { type: string; severity: 'High' | 'Medium' | 'Low'; detail: string }[];
  allergyWarnings: string[];
  contraindications: string[];
  patientAdvice: string;
  fullAnalysis: string;
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      You are a Senior Clinical Pharmacist providing high-stakes Clinical Decision Support (CDS).
      Analyze the patient's profile and the new prescription for safety.
      
      PATIENT PROFILE:
      - Name: ${patientContext.name}
      - Conditions: ${patientContext.conditions.join(', ')}
      - Allergies: ${patientContext.allergies.join(', ')}
      
      CURRENT MEDICATIONS (Active):
      ${JSON.stringify(patientContext.currentMedications)}
      
      NEW PRESCRIPTION:
      - Medication: ${currentRx.medication}
      - Dosage: ${currentRx.dosage}
      - Frequency: ${currentRx.frequency || 'Not specified'}
      
      TASK:
      1. Provide a concise summary.
      2. Determine Risk Level (High/Medium/Low).
      3. Determine Action Plan (STOP/COUNSEL/PROCEED).
      4. List specific interactions (Drug-Drug, Drug-Condition, etc.), allergies, and contraindications.
      5. For each interaction, specify the type, severity (High/Medium/Low), and a brief clinical explanation.
      6. Provide patient advice.
      7. Provide a full detailed analysis in Markdown.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          riskLevel: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          actionPlan: { type: Type.STRING, enum: ['STOP', 'COUNSEL', 'PROCEED'] },
          interactions: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                detail: { type: Type.STRING }
              },
              required: ["type", "severity", "detail"]
            } 
          },
          allergyWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          contraindications: { type: Type.ARRAY, items: { type: Type.STRING } },
          patientAdvice: { type: Type.STRING },
          fullAnalysis: { type: Type.STRING }
        },
        required: ["summary", "riskLevel", "actionPlan", "fullAnalysis", "interactions"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateLabelImage(prescriptionData: any, includeError: boolean = false): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().split('T')[0];
  
  const prompt = `Generate a realistic, high-quality pharmacy medication label for a patient.
  
  DETAILS TO INCLUDE (EXACT TEXT):
  - Pharmacy: RxFlow Clinical Pharmacy
  - Patient: ${prescriptionData.patientName}
  - Medication: ${prescriptionData.medication}
  - Dosage: ${prescriptionData.dosage}
  - Instructions: ${includeError ? "Take TWO tablets thrice daily (ERROR)" : prescriptionData.frequency}
  - Quantity: ${prescriptionData.quantity || '28'} Units
  - Dispensed Date: ${today}
  - Expiry Date: ${expiry}
  
  The label should look professional, with clear typography and standard pharmacy layout. ${includeError ? "DELIBERATELY include a dosage error in the instructions for testing purposes." : ""}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ text: prompt }],
    config: {
      imageConfig: {
        aspectRatio: "4:3",
        imageSize: "1K"
      }
    }
  });

  let imageUrl = "";
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }
  return imageUrl;
}

export async function validateLabel(labelImage: string, prescriptionData: any): Promise<{
  passed: boolean;
  discrepancies: string[];
  reasoning: string;
  confidence: number;
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { text: `You are a Pharmacy Quality Control AI. 
      Compare the medication label (image) with the prescription data.
      
      PRESCRIPTION DATA: ${JSON.stringify(prescriptionData)}
      
      VALIDATION RULES:
      1. Patient Name: Must match the patient name in the prescription. Minor capitalization or middle initials are acceptable.
      2. Drug Name & Strength: Must match. "Amoxicillin 500mg" and "Amoxicillin 500 mg" are identical. If the medication name includes the strength (e.g., "Amoxicillin 500mg"), the dosage field should be consistent with it.
      3. Dosage Instructions: Must have the same clinical meaning. "One tablet daily" is the same as "1 tab a day" or "Take 1 tablet daily".
      4. Quantity: Should match the prescribed quantity if visible.
      5. Dates: 
         - Expiry Date: Must be present and in the future.
         - Dispensed Date vs Issue Date: It is NORMAL and EXPECTED for the Dispensed Date on the label to be LATER than the Issue Date on the prescription. This is NOT an error. DO NOT flag this as a discrepancy.
      6. Pharmacy Details: Should be present (e.g., "RxFlow Clinical Pharmacy").
      
      CRITICAL: Do not flag minor formatting, stylistic differences, or expected date variations (Dispensed vs Issued) as discrepancies. Only flag clinical errors or missing critical information.
      
      Return a JSON object with passed (boolean), discrepancies (array of strings), reasoning, and confidence (0-1).` },
      { inlineData: { 
          mimeType: "image/png", 
          data: labelImage.includes('base64,') ? labelImage.split('base64,')[1] : labelImage 
        } 
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          passed: { type: Type.BOOLEAN },
          discrepancies: { type: Type.ARRAY, items: { type: Type.STRING } },
          reasoning: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ["passed", "discrepancies", "reasoning", "confidence"]
      }
    }
  });

  return JSON.parse(response.text || '{"passed": false, "discrepancies": ["Label validation failed"], "reasoning": "Internal error", "confidence": 0}');
}

export async function getConsultationInsight(transcript: string, patientContext: any): Promise<{
  summary: string;
  clinicalRecommendations: string[];
  patientConcerns: string[];
  followUpActions: string[];
  documentation: string;
  sentiment: 'Positive' | 'Neutral' | 'Anxious' | 'Frustrated';
  adherenceRisk: 'High' | 'Medium' | 'Low';
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a Clinical Pharmacist Assistant. 
    Analyze the following transcript of a patient consultation.
    
    PATIENT CONTEXT: ${JSON.stringify(patientContext)}
    TRANSCRIPT: "${transcript}"
    
    TASK:
    1. Summarize the key points of the conversation.
    2. Identify specific clinical recommendations based on the dialogue.
    3. List patient concerns or questions raised.
    4. Suggest follow-up actions for the pharmacist.
    5. Provide a professional clinical note (documentation) of the encounter.
    6. Determine the patient's emotional sentiment (Positive/Neutral/Anxious/Frustrated).
    7. Assess the risk of medication non-adherence based on the conversation (High/Medium/Low).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          clinicalRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          patientConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
          followUpActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          documentation: { type: Type.STRING },
          sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Anxious', 'Frustrated'] },
          adherenceRisk: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
        },
        required: ["summary", "clinicalRecommendations", "patientConcerns", "followUpActions", "documentation", "sentiment", "adherenceRisk"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
