'use client'

import { useState } from 'react'
import { QuoteCard } from '../components/QuoteCard'
import { HistoryList } from '../components/HistoryList'

export default function Home() {
  const [key, setKey] = useState(0)

  const handleNext = () => {
    setKey(prevKey => prevKey + 1)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-3xl font-bold mb-8">PhiloCard</h1>
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleNext}
      >
        Next
      </button>
      <QuoteCard key={key} />
      <HistoryList />
    </main>
  )
}