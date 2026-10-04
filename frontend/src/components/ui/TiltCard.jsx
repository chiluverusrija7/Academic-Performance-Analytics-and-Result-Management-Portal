import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  glare = true,
  scale = 1.02,
  ...props
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Spring physics for buttery smoothness
  const springConfig = { damping: 20, stiffness: 150 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  const rotateX = useTransform(mouseY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseX, [0, 1], [-maxTilt, maxTilt]);

  const handlePointerMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;
    x.set(relativeX);
    y.set(relativeY);
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="relative transition-transform"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`relative rounded-2xl overflow-hidden ${className}`}
        {...props}
      >
        {children}

        {/* Dynamic Specular Light Glare */}
        {glare && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.35 : 0,
              background: `radial-gradient(circle at ${x.get() * 100}% ${y.get() * 100}%, rgba(255, 255, 255, 0.25) 0%, rgba(56, 189, 248, 0.08) 35%, transparent 70%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
