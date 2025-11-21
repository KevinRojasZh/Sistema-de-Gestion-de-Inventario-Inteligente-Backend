import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY)

export async function analyzeProduct(name) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('La IA no devolvió JSON válido')

  const cleanJson = jsonMatch[0]
  console.log('RESULTADO DE LA IA ', cleanJson)

  return JSON.parse(cleanJson)
}
