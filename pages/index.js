import React, { useState, useEffect, useRef, useCallback } from 'react';
import fs from 'fs';
import path from 'path';
import styles from '../styles/Home.module.css';
import Link from 'next/link';

export default function Home({ quotes, images }) {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [generatedRecords, setGeneratedRecords] = useState([]);
  const [html2canvas, setHtml2canvas] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    import('html2canvas').then(module => {
      setHtml2canvas(() => module.default);
    });
  }, []);

  const generateHash = useCallback((str) => {
    let hash = 0;
    const randomSalt = Math.random().toString(36).substring(7);
    const saltedStr = str + randomSalt;
    for (let i = 0; i < saltedStr.length; i++) {
      const char = saltedStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }, []);

  const generateNewCard = useCallback(() => {
    setIsLoading(true);
    const cardElement = cardRef.current;
    
    if (cardElement) {
      cardElement.style.setProperty('--blur', '10px');
      cardElement.style.setProperty('--scale', '0.95');
      cardElement.style.setProperty('--opacity', '0.7');
    }

    setTimeout(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      const randomImage = images[Math.floor(Math.random() * images.length)];
      const hash = generateHash(`${randomImage}${randomQuote.id}`);
      
      setCurrentQuote(randomQuote);
      setCurrentImage(randomImage);
      setIsFlipped(false);
      setGeneratedRecords(prevRecords => {
        const newRecord = {
          id: hash,
          imageSource: randomImage,
          quoteId: randomQuote.id,
          timestamp: new Date().toISOString()
        };
        
        const filteredRecords = prevRecords.filter(record => record.id !== hash);
        const updatedRecords = [newRecord, ...filteredRecords].slice(0, 5);
        
        return updatedRecords;
      });
      
      requestAnimationFrame(() => {
        if (cardElement) {
          cardElement.style.setProperty('--blur', '0px');
          cardElement.style.setProperty('--scale', '1');
          cardElement.style.setProperty('--opacity', '1');
        }
        setIsLoading(false);
      });
    }, 500);
  }, [quotes, images, generateHash]);

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

      const blob = await new Promise(resolve => borderedCanvas.toBlob(resolve, 'image/png'));
      const fileName = `philocard_${generatedRecords[0].id}.png`;

      if (isMobile && navigator.share) {
        try {
          await navigator.share({
            files: [new File([blob], fileName, { type: 'image/png' })],
            title: 'PhiloCard',
            text: 'Check out this philosophical quote!',
          });
        } catch (error) {
          fallbackDownload(blob, fileName);
        }
      } else {
        fallbackDownload(blob, fileName);
      }
    } catch (error) {
      // Handle error silently or show a user-friendly message
    }
  };

  const fallbackDownload = (blob, fileName) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = window.navigator.userAgent;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <button className={styles.button} onClick={generateNewCard} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Next'}
        </button>
        <button className={styles.button} onClick={handleDownload} disabled={!currentQuote || !currentImage}>
          {isMobile ? 'Share' : 'Download'}
        </button>
      </div>
      
      <div className={styles.middleSection}>
        {currentQuote && currentImage ? (
          <div 
            ref={cardRef}
            className={`${styles.card} ${isFlipped ? styles.flipped : ''} ${isLoading ? styles.loading : ''}`}
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
          {generatedRecords.slice(0, 5).map((record) => (
            <li key={record.id}>
              Image: {record.imageSource}, Quote ID: {record.quoteId}, Time: {record.timestamp}
            </li>
          ))}
        </ul>
      </div>
      
      {isMobile && (
        <p className={styles.iosHint}>
          On mobile devices, tap "Share" to save or share the image.
        </p>
      )}
      
      {/* 在最后添加 footer */}
      <footer className={styles.footer}>
        <Link href="/">
          <a className={styles.footerLink}>Home</a>
        </Link>
        <Link href="/mycard">
          <a className={styles.footerLink}>My Card</a>
        </Link>
        <Link href="/setting">
          <a className={styles.footerLink}>Setting</a>
        </Link>
      </footer>
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