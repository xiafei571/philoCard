import '../styles/globals.css'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const isActive = (pathname) => router.pathname === pathname

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <Component {...pageProps} user={user} />
      <footer className={styles.footer}>
        <Link href="/">
          <a className={`${styles.footerLink} ${isActive('/') ? styles.activeLink : ''}`}>
            Home
          </a>
        </Link>
        <Link href="/mycard">
          <a className={`${styles.footerLink} ${isActive('/mycard') ? styles.activeLink : ''}`}>
            My Card
          </a>
        </Link>
        <Link href="/setting">
          <a className={`${styles.footerLink} ${isActive('/setting') ? styles.activeLink : ''}`}>
            Setting
          </a>
        </Link>
      </footer>
    </div>
  )
}

export default MyApp