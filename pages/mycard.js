import React from 'react';
import styles from '../styles/Home.module.css';
import Login from '../components/Login';

export default function MyCard({ user }) {
  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <h1>Hello My Card</h1>
      <p>Welcome, {user.email}!</p>
    </div>
  );
}