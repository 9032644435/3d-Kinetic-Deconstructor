/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { Particles } from './components/Particles';
import { HUD } from './components/HUD';
import { SensorManager } from './components/SensorManager';

export default function App() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);

  useEffect(() => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      setNeedsPermission(true);
    } else {
      setPermissionGranted(true);
    }
  }, []);

  const handlePermissionGranted = () => {
    setPermissionGranted(true);
  };

  return (
    <div className="fixed inset-0 bg-[#020617] overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <Particles />
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
      
      <HUD 
        needsPermission={needsPermission} 
        permissionGranted={permissionGranted}
        onGrantPermission={handlePermissionGranted}
      />
      
      <SensorManager active={permissionGranted} />
    </div>
  );
}
