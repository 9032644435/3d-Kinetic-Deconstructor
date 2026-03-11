import { useEffect, useRef } from 'react';
import { useIntelStore } from '../store/useIntelStore';

export function SensorManager({ active }: { active: boolean }) {
  const setStability = useIntelStore(state => state.setStability);
  const setExplosionFactor = useIntelStore(state => state.setExplosionFactor);
  
  const lastAngles = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const stabilityRef = useRef(100);
  
  useEffect(() => {
    if (!active) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { alpha, beta, gamma } = event;
      if (alpha === null || beta === null || gamma === null) return;
      
      const dAlpha = Math.abs(alpha - lastAngles.current.alpha);
      const dBeta = Math.abs(beta - lastAngles.current.beta);
      const dGamma = Math.abs(gamma - lastAngles.current.gamma);
      
      // Calculate movement intensity
      const movement = dAlpha + dBeta + dGamma;
      
      // Update last angles
      lastAngles.current = { alpha, beta, gamma };
      
      // If movement is high, decrease stability. If low, recover.
      if (movement > 1) {
        stabilityRef.current = Math.max(0, stabilityRef.current - movement * 1.5);
      } else {
        stabilityRef.current = Math.min(100, stabilityRef.current + 0.5);
      }
      
      setStability(Math.round(stabilityRef.current));
      setExplosionFactor((100 - stabilityRef.current) / 100);
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    
    // Fallback for desktop: mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const movement = Math.abs(e.movementX) + Math.abs(e.movementY);
      if (movement > 2) {
        stabilityRef.current = Math.max(0, stabilityRef.current - movement * 0.5);
      } else {
        stabilityRef.current = Math.min(100, stabilityRef.current + 1);
      }
      setStability(Math.round(stabilityRef.current));
      setExplosionFactor((100 - stabilityRef.current) / 100);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Recovery loop for when there's no movement events firing
    const interval = setInterval(() => {
      stabilityRef.current = Math.min(100, stabilityRef.current + 1);
      setStability(Math.round(stabilityRef.current));
      setExplosionFactor((100 - stabilityRef.current) / 100);
    }, 50);
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [active, setStability, setExplosionFactor]);

  return null;
}
