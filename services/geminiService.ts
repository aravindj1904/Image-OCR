import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CSV_EXTRACTION_PROMPT } from "../constants";

// Initialize the Gemini Client
const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
    }
    return new GoogleGenAI({ apiKey });
};

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the Data-URI prefix (e.g., "data:image/png;base64,")
            const base64Data = result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const extractCsvFromImage = async (imageFile: File): Promise<string> => {
    const ai = getClient();
    const base64Data = await fileToBase64(imageFile);

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: imageFile.type,
                        data: base64Data,
                    },
                },
                {
                    text: CSV_EXTRACTION_PROMPT,
                },
            ],
        },
    });

    return response.text || "";
};

export const editImageWithPrompt = async (
    imageFile: File,
    prompt: string
): Promise<{ data: string; mimeType: string } | null> => {
    const ai = getClient();
    const base64Data = await fileToBase64(imageFile);

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Nano banana
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: imageFile.type,
                        data: base64Data,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
    });

    // Extract image from response parts
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    data: part.inlineData.data,
                    mimeType: 'image/png', // API typically returns PNG for generated images unless specified
                };
            }
        }
    }

    return null;
};
