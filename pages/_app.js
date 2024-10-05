import '../styles/globals.css'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  const isActive = (pathname) => router.pathname === pathname

  return (
    <div className={styles.container}>
      <Component {...pageProps} />
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