'use client'

import { useState, useEffect } from 'react'

interface HistoryItem {
  imageId: string
  quoteId: string
  timestamp: string
}

export function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    // 这里需要实现获取历史记录的逻辑
  }, [])

  return (
    <ul className="mt-4">
      {history.map((item, index) => (
        <li key={index}>
          Image: {item.imageId}, Quote: {item.quoteId}, Time: {item.timestamp}
        </li>
      ))}
    </ul>
  )
}