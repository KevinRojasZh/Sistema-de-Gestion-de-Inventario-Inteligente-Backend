import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY)

export async function analyzeProduct(name) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `
  Dame una descripción corta y una categoría adecuada
  para un producto llamado "${name}".
  RESPONDE SOLO JSON:

  {
    "descripcion": "...",
    "categoria": "..."
  }
  `
  const result = await model.generateContent(prompt)
  const text = result.response.text()

  return JSON.parse(text)
}
