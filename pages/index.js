import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/Home.module.css';
// 导入空心和实心星星图标
import { FaRedo, FaDownload, FaShare, FaStar, FaRegStar } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { storage, auth } from '../lib/firebase'; // 直接从 firebase.js 导入 auth
// 移除 getUserInfo 的导入
import { ref, getDownloadURL } from "firebase/storage";
// 导入 html2canvas
import html2canvas from 'html2canvas';
import { formatDate } from '../lib/clientUtils'; // 改为

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedData, setLastGeneratedData] = useState(null);
  const [isCached, setIsCached] = useState(false);
  // 移除 userInfo 状态

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
      setLastGeneratedData(data);
      setIsCached(false); // 重置收藏状态
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
    if (!cardRef.current) return;

    try {
      const cardFront = cardRef.current.querySelector(`.${styles.cardFront}`);
      if (!cardFront) return;

      const canvas = await html2canvas(cardFront, {
        useCORS: true,
        allowTaint: true,
        scale: 2
      });

      const borderedCanvas = document.createElement('canvas');
      const borderedCtx = borderedCanvas.getContext('2d');
      const borderWidth = 20;
      borderedCanvas.width = canvas.width + borderWidth * 2;
      borderedCanvas.height = canvas.height + borderWidth * 2;

      borderedCtx.fillStyle = 'white';
      borderedCtx.fillRect(0, 0, borderedCanvas.width, borderedCanvas.height);
      borderedCtx.drawImage(canvas, borderWidth, borderWidth);

      const blob = await new Promise(resolve => borderedCanvas.toBlob(resolve, 'image/png'));
      const fileName = `philocard_${Date.now()}.png`;

      if (isMobile && navigator.share) {
        try {
          const file = new File([blob], fileName, { type: 'image/png' });
          await navigator.share({
            files: [file],
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
      // 如果需要，可以在这里添加一个用户友好的错误提示
      console.error('Failed to download image');
    }
  };

  const fallbackDownload = (blob, fileName) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleFavorite = () => {
    console.log('Last generated data:', lastGeneratedData);
    const user = auth.currentUser;
    if (user) {
      console.log('User info:', {
        Email: user.email,
        'User ID': user.uid,
        'Email Verified': user.emailVerified ? 'Yes' : 'No',
        'Account Created': formatDate(user.metadata.creationTime),
        'Last Sign In': formatDate(user.metadata.lastSignInTime)
      });
    } else {
      console.log('User not logged in');
    }
    setIsCached(!isCached); // 切换收藏状态
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
    <div className={styles.mainContainer}>
      
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

      <div className={styles.iconSection}>
        <button className={`${styles.iconButton} ${styles.nextButton}`} onClick={generateNewCard} disabled={isLoading}>
          {isLoading ? <FaRedo className={styles.spinning} /> : <FaRedo />}
        </button>
        <button className={`${styles.iconButton} ${styles.downloadButton}`} onClick={handleDownload} disabled={!currentQuote || !currentImage}>
          {isMobile ? <FaShare /> : <FaDownload />}
        </button>
        <button 
          className={`${styles.iconButton} ${styles.favoriteButton}`} 
          onClick={handleFavorite} 
          disabled={!lastGeneratedData}
        >
          {isCached ? <FaStar /> : <FaRegStar />}
        </button>
      </div>
    </div>
  );
}