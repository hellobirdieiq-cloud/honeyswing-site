/**
 * CubeView — React Native component wrapping expo-gl + Three.js.
 *
 * Renders a 3D Rubik's cube with touch orbit and move animation.
 * gl.endFrameEXP() called at the end of every frame.
 */
import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, PanResponder } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { CubeScene } from '../renderer/CubeScene';
import { MoveAnimator } from '../renderer/MoveAnimator';
import { CubeState } from '../engine/CubeState';
import { ORBIT_SENSITIVITY } from '../renderer/constants';

const CubeView = forwardRef(function CubeView({ cubeState, onStateChange, style }, ref) {
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animatorRef = useRef(null);
  const rafRef = useRef(null);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    enqueueMove(moveName) {
      if (animatorRef.current) {
        animatorRef.current.enqueue(moveName);
      }
    },
    get isAnimating() {
      return animatorRef.current ? animatorRef.current.isAnimating : false;
    },
    showHighlight(positions) {
      if (sceneRef.current) sceneRef.current.showHighlight(positions);
    },
    showArrow(moveName) {
      if (sceneRef.current) sceneRef.current.showArrow(moveName);
    },
    hideArrow() {
      if (sceneRef.current) sceneRef.current.hideArrow();
    },
    clearHighlight() {
      if (sceneRef.current) sceneRef.current.showHighlight(null);
    },
  }));

  // Touch orbit
  const prevGesture = useRef({ dx: 0, dy: 0 });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        prevGesture.current = { dx: 0, dy: 0 };
      },
      onPanResponderMove: (_, gesture) => {
        if (!sceneRef.current) return;
        const ddx = gesture.dx - prevGesture.current.dx;
        const ddy = gesture.dy - prevGesture.current.dy;
        prevGesture.current = { dx: gesture.dx, dy: gesture.dy };
        sceneRef.current.orbit(-ddx * ORBIT_SENSITIVITY, -ddy * ORBIT_SENSITIVITY);
      },
      onPanResponderRelease: () => {
        if (sceneRef.current) sceneRef.current.snapBack();
      },
      onPanResponderTerminate: () => {
        if (sceneRef.current) sceneRef.current.snapBack();
      },
    }),
  ).current;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      animatorRef.current = null;
    };
  }, []);

  const onContextCreate = useCallback((gl) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas: {
        width,
        height,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        clientHeight: height,
      },
      context: gl,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    rendererRef.current = renderer;

    // Scene
    const scene = new CubeScene();
    const state = cubeState || new CubeState();
    scene.init(width, height, state);
    sceneRef.current = scene;

    // Animator
    const animator = new MoveAnimator(scene, state);
    animator.onStateChange = onStateChange || null;
    animatorRef.current = animator;

    // Render loop
    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      if (!sceneRef.current || !rendererRef.current) return;

      const now = performance.now();

      // Drive move animation
      if (animatorRef.current) {
        animatorRef.current.update(now);
      }

      // Drive highlight pulse
      sceneRef.current.update(now);

      rendererRef.current.render(sceneRef.current.scene, sceneRef.current.camera);
      gl.endFrameEXP();
    };
    render();
  }, []);

  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
      <GLView style={styles.gl} onContextCreate={onContextCreate} />
    </View>
  );
});

export default CubeView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gl: {
    flex: 1,
  },
});
