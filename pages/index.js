import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { storage } from '../lib/firebase';
import { ref, getDownloadURL } from "firebase/storage";

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [html2canvas, setHtml2canvas] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateNewCard = useCallback(async () => {
    setIsLoading(true);
    const cardElement = cardRef.current;
    
    if (cardElement) {
      cardElement.style.setProperty('--blur', '10px');
      cardElement.style.setProperty('--scale', '0.95');
      cardElement.style.setProperty('--opacity', '0.7');
    }

    try {
      const response = await fetch('/api/generate-card');
      const data = await response.json();

      setCurrentQuote({
        quote: data.quote.quote,
        author: data.quote.author,
        background: data.quote.background
      });

      // 使用 Firebase Storage 获取图片 URL
      const imageRef = ref(storage, data.src_img);
      const imageUrl = await getDownloadURL(imageRef);
      setCurrentImage(imageUrl);

      setIsFlipped(false);
    } catch (error) {
      console.error('Error generating new card:', error);
    } finally {
      requestAnimationFrame(() => {
        if (cardElement) {
          cardElement.style.setProperty('--blur', '0px');
          cardElement.style.setProperty('--scale', '1');
          cardElement.style.setProperty('--opacity', '1');
        }
        setIsLoading(false);
      });
    }
  }, []);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const cardRef = useRef(null);

  const handleDownload = async () => {
    if (!cardRef.current || !html2canvas) return;

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
      const fileName = `philocard_${Date.now()}.png`;

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
                <img src={currentImage} alt="Philosophy" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
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