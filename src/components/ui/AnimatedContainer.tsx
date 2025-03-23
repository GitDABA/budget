'use client';

import React from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

type AnimationVariant = 'fadeIn' | 'slideUp' | 'slideRight' | 'scale';

interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  variant?: AnimationVariant;
  className?: string;
}

const variants: Record<AnimationVariant, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  },
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }
};

export const AnimatedContainer = ({
  children,
  delay = 0,
  duration = 0.5,
  variant = 'fadeIn',
  className,
  ...props
}: AnimatedContainerProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[variant]}
      transition={{ 
        duration, 
        delay,
        ease: 'easeOut'
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContainer;
