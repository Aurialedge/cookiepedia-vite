import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './css/AnimatedHeadline.css';

const headlines = [
  "Discover thousands of unique recipes.",
  "Share your creations with the world.",
  "Connect with fellow food lovers.",
  "Your AI-powered cooking assistant.",
  "Join the ultimate cooking community."
];

const headlineVariants = {
  enter: {
    y: 50,
    opacity: 0
  },
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1
  },
  exit: {
    zIndex: 0,
    y: -50,
    opacity: 0
  }
};

const AnimatedHeadline = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % headlines.length);
    }, 4000); // Change headline every 4 seconds

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="animated-headline-container">
      <AnimatePresence mode='wait'>
        <motion.h1
          key={index}
          variants={headlineVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ y: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.5 } }}
        >
          {headlines[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedHeadline;
