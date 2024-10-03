import fs from 'fs/promises'
import path from 'path'

export async function getRandomImage() {
  const imageDir = path.join(process.cwd(), 'public', 'images')
  const files = await fs.readdir(imageDir)
  const randomIndex = Math.floor(Math.random() * files.length)
  return `/images/${files[randomIndex]}`
}

export async function getRandomQuote() {
  const quotesPath = path.join(process.cwd(), 'philosophyText', 'quotes.json')
  const quotesContent = await fs.readFile(quotesPath, 'utf-8')
  const quotes = JSON.parse(quotesContent)
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex]
}