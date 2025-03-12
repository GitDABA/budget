'use client';

import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

type AnimatedContainerProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'none';
  once?: boolean;
  customVariants?: Variants;
  viewport?: { once?: boolean; margin?: string; amount?: 'some' | 'all' | number };
};

export function AnimatedContainer({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  variant = 'fadeIn',
  once = true,
  customVariants,
  viewport = { once: true, margin: '0px 0px -100px 0px' },
}: AnimatedContainerProps) {
  // Default animation variants
  const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration, delay } },
  };

  const slideUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration, delay, ease: [0.25, 0.1, 0.25, 1.0] } },
  };

  const slideLeft: Variants = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration, delay, ease: [0.25, 0.1, 0.25, 1.0] } },
  };

  const slideRight: Variants = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration, delay, ease: [0.25, 0.1, 0.25, 1.0] } },
  };

  const scale: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration, delay, ease: [0.25, 0.1, 0.25, 1.0] } },
  };

  const none: Variants = {
    hidden: {},
    visible: {},
  };

  // Select the variant
  const variants = 
    customVariants || 
    (variant === 'fadeIn' ? fadeIn :
     variant === 'slideUp' ? slideUp :
     variant === 'slideLeft' ? slideLeft :
     variant === 'slideRight' ? slideRight :
     variant === 'scale' ? scale : none);

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedContainer;
