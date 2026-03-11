import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIntelStore } from '../store/useIntelStore';

const vertexShader = `
  uniform float uTime;
  uniform float uExplosion;
  varying vec3 vColor;
  
  void main() {
    vec3 dir = normalize(position);
    float noise = sin(uTime * 5.0 + position.y * 10.0 + position.x * 5.0) * 0.5 + 0.5;
    
    // Base position + explosion displacement
    vec3 newPos = position + dir * (uExplosion * 4.0 * noise);
    
    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (20.0 / -mvPosition.z) * (1.0 + uExplosion * 2.0);
    
    // Color varies based on explosion
    vec3 baseColor = vec3(0.0, 0.8, 1.0); // Cyan
    vec3 hotColor = vec3(1.0, 0.2, 0.0);  // Red/Orange
    vColor = mix(baseColor, hotColor, clamp(uExplosion, 0.0, 1.0));
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Circular point
    vec2 coord = gl_PointCoord - vec2(0.5);
    if(length(coord) > 0.5) discard;
    
    // Soft glow
    float alpha = 1.0 - (length(coord) * 2.0);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export function Particles() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Points>(null);
  const explosionFactor = useIntelStore(state => state.explosionFactor);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uExplosion: { value: 0 }
  }), []);

  const geometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(2, 16); // Radius 2, detail 16 -> lots of vertices
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Smoothly interpolate explosion factor for fluid motion
      materialRef.current.uniforms.uExplosion.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uExplosion.value,
        explosionFactor,
        0.1
      );
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.001;
    }
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
