
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

const { API_KEY } = process.env;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!ai) {
    return res.status(503).json({ message: "AI service is not available. API key is missing." });
  }

  const { data: dataSample } = req.body;

  if (!dataSample || !Array.isArray(dataSample) || dataSample.length === 0) {
    return res.status(400).json({ message: "Data sample is required for analysis." });
  }

  const prompt = `
You are a friendly and insightful data analyst co-pilot. Your task is to analyze a dataset from an Excel file and provide a concise, insightful summary as if you are talking to a colleague.

- Start with a friendly greeting, like "Hello! I've taken a look at your data, and here's what I've found:".
- Analyze the following JSON data sample.
- The keys of the JSON objects are the column headers.
- Format your response in clear, easy-to-read markdown. Use headings, bullet points, and bold text to structure your insights.
- Do not just describe the data; interpret it. What could this data imply? What are the key takeaways?
- Keep the summary friendly, concise, and focused on actionable insights.
- End with an encouraging closing, like "I hope this helps your analysis! Let me know if you need to dig deeper into anything else."

Here is the data sample:
\`\`\`json
${JSON.stringify(dataSample, null, 2)}
\`\`\`
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
        topP: 0.95,
        topK: 64,
      }
    });

    res.status(200).json({ summary: response.text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ message: "Failed to communicate with the AI service." });
  }
}
