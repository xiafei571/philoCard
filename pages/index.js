import React, { useState, useEffect, useRef } from 'react';
import fs from 'fs';
import path from 'path';
import styles from '../styles/Home.module.css';
import crypto from 'crypto';

export default function Home({ quotes, images }) {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [generatedRecords, setGeneratedRecords] = useState([]);
  const [html2canvas, setHtml2canvas] = useState(null);

  useEffect(() => {
    import('html2canvas').then(module => {
      setHtml2canvas(() => module.default);
    });
  }, []);

  const generateHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16); // Convert to positive hexadecimal
  };

  const generateNewCard = () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const hash = generateHash(`${randomImage}${randomQuote.id}`);
    setCurrentQuote(randomQuote);
    setCurrentImage(randomImage);
    setIsFlipped(false);
    setGeneratedRecords(prev => {
      const newRecord = {
        id: hash,
        imageSource: randomImage,
        quoteId: randomQuote.id,
        timestamp: new Date().toISOString()
      };
      const updatedRecords = [newRecord, ...prev].slice(0, 5);
      return updatedRecords;
    });
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const cardRef = useRef(null);

  const handleDownload = async () => {
    if (!cardRef.current || !html2canvas || !generatedRecords.length) return;

    try {
      const cardFront = cardRef.current.querySelector(`.${styles.cardFront}`);
      if (!cardFront) return;

      const canvas = await html2canvas(cardFront, {
        backgroundColor: null,
      });
      
      const borderedCanvas = document.createElement('canvas');
      const ctx = borderedCanvas.getContext('2d');
      const borderWidth = 10; 
      borderedCanvas.width = canvas.width + borderWidth * 2;
      borderedCanvas.height = canvas.height + borderWidth * 2;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, borderedCanvas.width, borderedCanvas.height);
      
      ctx.drawImage(canvas, borderWidth, borderWidth);

      const link = document.createElement('a');
      link.download = `philocard_${generatedRecords[0].id}.png`;
      link.href = borderedCanvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <button className={styles.button} onClick={generateNewCard}>Next</button>
        <button className={styles.button} onClick={handleDownload} disabled={!currentQuote || !currentImage}>Download</button>
      </div>
      
      <div className={styles.middleSection}>
        {currentQuote && currentImage ? (
          <div 
            ref={cardRef}
            className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
            onClick={handleCardClick}
          >
            <div className={styles.cardInner}>
              <div className={styles.cardFront}>
                <img src={`/images/src/${currentImage}`} alt="Philosophy" />
                <div className={styles.quoteOverlay}>
                  <p>{currentQuote.quote}</p>
                  <p>- {currentQuote.author}</p>
                </div>
              </div>
              <div className={styles.cardBack}>
                <div className={styles.cardBackContent}>
                  <h3>Background:</h3>
                  <p>{currentQuote?.background || 'No background available'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            Click 'Next' to generate a card
          </div>
        )}
      </div>
      
      <div className={styles.bottomSection}>
        <h3>Generated Records:</h3>
        <ul className={styles.recordsList}>
          {generatedRecords.map((record) => (
            <li key={record.id}>
              Image: {record.imageSource}, Quote ID: {record.quoteId}, Time: {record.timestamp}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const quotesPath = path.join(process.cwd(), 'philosophyText', 'quotes.json');
  const quotesData = fs.readFileSync(quotesPath, 'utf8');
  const quotes = JSON.parse(quotesData);

  const imagesDirectory = path.join(process.cwd(), 'public', 'images', 'src');
  const images = fs.readdirSync(imagesDirectory).filter(file => 
    !file.startsWith('.') && 
    (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif'))
  );

  return {
    props: {
      quotes,
      images,
    },
  };
}