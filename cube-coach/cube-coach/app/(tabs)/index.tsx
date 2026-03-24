import { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CubeView from '@/src/components/CubeView';
import MoveButtons from '@/src/components/MoveButtons';
import { CubeState } from '@/src/engine/CubeState';

const solvedState = new CubeState();

export default function HomeScreen() {
  const cubeRef = useRef(null);

  const handleMove = (moveName: string) => {
    cubeRef.current?.enqueueMove(moveName);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cube Coach</Text>
      </View>
      <CubeView ref={cubeRef} cubeState={solvedState} style={styles.cube} />
      <MoveButtons onMove={handleMove} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  cube: {
    flex: 1,
  },
});
