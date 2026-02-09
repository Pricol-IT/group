
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Environment } from '@react-three/drei';

/**
 * Component to load and display the GLB model.
 * Ensure 'mountains.glb' is in your public/images folder (e.g., public/images/mountains.glb).
 */
function Model(props) {
    // Replace with the actual path to your GLB file in the public directory
    const { scene } = useGLTF('images/smoke-background.jpg');
    return <primitive object={scene} {...props} />;
}

export default function MountainViewer() {
    return (
        <div style={{ width: '100%', height: '100vh', background: '#f0f0f0' }}>
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                <Suspense fallback={null}>
                    <Stage environment={null} intensity={1} contactShadow={false} shadowBias={-0.0015}>
                        <Model scale={0.5} />
                    </Stage>
                    {/* Add an environment map for better lighting reflections */}
                    <Environment preset="city" />
                </Suspense>
                <OrbitControls autoRotate />
            </Canvas>
        </div>
    );
}

// Preload the model to avoid pop-in
useGLTF.preload('/images/mountains.glb');
