/**
 * MoveButtons — 6 face buttons with CW and CCW for each.
 * Compact two-row layout: top row U/D/R, bottom row L/F/B.
 * Each face has CW (tap) and CCW (') buttons.
 */
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const FACES = ['U', 'D', 'R', 'L', 'F', 'B'];

const FACE_COLORS = {
  U: '#ffffff',
  D: '#FFD500',
  R: '#B71234',
  L: '#FF5800',
  F: '#009B48',
  B: '#0046AD',
};

function MoveButton({ label, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.btn, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Text style={[styles.btnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function MoveButtons({ onMove }) {
  return (
    <View style={styles.container}>
      {FACES.map((face) => (
        <View key={face} style={styles.faceGroup}>
          <MoveButton
            label={face}
            color={FACE_COLORS[face]}
            onPress={() => onMove(face)}
          />
          <MoveButton
            label={face + "'"}
            color={FACE_COLORS[face]}
            onPress={() => onMove(face + "'")}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 6,
  },
  faceGroup: {
    flexDirection: 'row',
    gap: 3,
  },
  btn: {
    width: 44,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
