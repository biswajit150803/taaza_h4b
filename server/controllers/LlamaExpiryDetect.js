import fs from 'fs';
import path from 'path';
import { Groq } from 'groq-sdk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const estimateExpiry = async (req, res) => {
  try {
    const { fruitName, freshness } = req.body;
    const imageFile = req.file;

    const imageBuffer = fs.readFileSync(path.join(__dirname, '../', imageFile.path));
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            "Given the image of a Fruit, its fresh or rotten and the name of the fruit, estimate a range of days it will take before it expires. Only output the number of days or the range or say 'Already expired'."
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${freshness}\n${fruitName}`
            },
            {
              type: 'image_url',
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.7,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false
    });

    res.json({ result: chatCompletion.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing the image.' });
  }
};