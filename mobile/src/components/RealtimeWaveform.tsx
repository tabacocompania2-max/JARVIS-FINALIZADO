import React, { useEffect, useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import { Canvas, Path, Skia, useValue, useDerivedValue } from '@shopify/react-native-skia';
import { audioStreamer } from '../audio/audioStreamer';

const { width } = Dimensions.get('window');
const HEIGHT = 100;

export const RealtimeWaveform = ({ isListening }: { isListening: boolean }) => {
  const path = useValue(Skia.Path.Make());
  
  // Generar onda aleatoria pero armónica para la demostración inicial
  // En el siguiente paso la conectaremos con los datos reales del FFT
  useEffect(() => {
    let animationFrame: number;
    let phase = 0;

    const animate = () => {
      const newPath = Skia.Path.Make();
      newPath.moveTo(0, HEIGHT / 2);

      for (let x = 0; x <= width; x += 10) {
        const amplitude = isListening ? 20 + Math.random() * 10 : 2;
        const y = (HEIGHT / 2) + Math.sin(x * 0.05 + phase) * amplitude;
        newPath.lineTo(x, y);
      }

      path.current = newPath;
      phase += 0.1;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isListening]);

  return (
    <View style={{ height: HEIGHT, width: '100%', backgroundColor: 'transparent' }}>
      <Canvas style={{ flex: 1 }}>
        <Path
          path={path}
          color="#06b6d4"
          style="stroke"
          strokeWidth={3}
          strokeJoin="round"
        />
      </Canvas>
    </View>
  );
};
