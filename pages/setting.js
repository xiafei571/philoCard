import React from 'react';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import styles from '../styles/Home.module.css';
import Login from '../components/Login';

export default function Setting({ user }) {
  const router = useRouter();

  if (!user) {
    return <Login />;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // 登出后重定向到首页
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={styles.settingContainer}>
      <h1>User Settings</h1>
      <div className={styles.userInfo}>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.uid}</p>
        <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
        <p><strong>Account Created:</strong> {user.metadata.creationTime}</p>
        <p><strong>Last Sign In:</strong> {user.metadata.lastSignInTime}</p>
      </div>
      <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
    </div>
  );
}