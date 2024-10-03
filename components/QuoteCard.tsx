'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function QuoteCard() {
  const [flipped, setFlipped] = useState(false)
  const [quote, setQuote] = useState({ id: '', quote: '', author: '', background: '' })
  const [imageSrc, setImageSrc] = useState('')

  const fetchRandomData = async () => {
    const response = await fetch('/api/random');
    const data = await response.json();
    setImageSrc(data.image);
    setQuote(data.quote);
  }

  useEffect(() => {
    fetchRandomData();
  }, [])

  return (
    <div
      className={`relative w-64 h-64 cursor-pointer ${flipped ? 'rotate-y-180' : ''}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="absolute w-full h-full backface-hidden">
        <Image src={imageSrc} alt="Quote background" layout="fill" objectFit="cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
          <p>{quote.quote}</p>
          <p className="text-right">- {quote.author}</p>
        </div>
      </div>
      <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gray-200 p-4">
        <p>{quote.background}</p>
      </div>
    </div>
  )
}