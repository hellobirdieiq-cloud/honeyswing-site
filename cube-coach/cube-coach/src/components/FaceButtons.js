/**
 * FaceButtons — color-coded face buttons for Coach Mode.
 *
 * 6 colored square buttons: tap = CW, long-press = CCW.
 * No letters — just the face color (white, yellow, red, orange, green, blue).
 */
import React, { useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';

const FACES = [
  { face: 'U', color: '#ffffff', border: '#cccccc' },
  { face: 'D', color: '#FFD500', border: '#c9a800' },
  { face: 'R', color: '#B71234', border: '#8a0e27' },
  { face: 'L', color: '#FF5800', border: '#cc4600' },
  { face: 'F', color: '#009B48', border: '#007436' },
  { face: 'B', color: '#0046AD', border: '#003580' },
];

const LONG_PRESS_MS = 300;

export default function FaceButtons({ onMove }) {
  return (
    <View style={styles.container}>
      {FACES.map(({ face, color, border }) => (
        <FaceButton
          key={face}
          face={face}
          color={color}
          border={border}
          onMove={onMove}
        />
      ))}
    </View>
  );
}

function FaceButton({ face, color, border, onMove }) {
  const handlePress = useCallback(() => {
    onMove(face); // CW
  }, [face, onMove]);

  const handleLongPress = useCallback(() => {
    onMove(face + "'"); // CCW
  }, [face, onMove]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: color, borderColor: border },
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={LONG_PRESS_MS}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
  },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
});
