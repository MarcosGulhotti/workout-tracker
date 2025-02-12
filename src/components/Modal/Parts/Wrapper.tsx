import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

type ModalWrapperProps = {
  children: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
};

/**
 * Renders an animated modal wrapper that includes a sliding transition and a fading background.
 * 
 * @param children - The content to render inside the modal.
 * @param visible - Controls the visibility state of the modal. Defaults to true.
 * @param onClose - Optional callback fired after the modal finishes closing.
 * 
 * @remarks
 * The modal animates into view by sliding up and fading in the background overlay, and
 * animates out by sliding down and fading out the overlay. Once the closing animation finishes,
 * it triggers the onClose callback (if provided) and removes itself from the render tree.
 */
export function ModalWrapper({
  children,
  visible = true, //TODO should start false
  onClose,
}: ModalWrapperProps) {
  const [shouldRender, setShouldRender] = useState(visible);

  // Slide up/down animation
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Fade in/out animation for the background overlay
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // If the modal is about to open, ensure we render it first
      setShouldRender(true);

      // Animate in parallel: fade the background in AND slide the content up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate background fade out and slide down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Once animation finishes, remove from render tree
        setShouldRender(false);
        onClose?.();
      });
    }
  }, [visible]);

  // If we no longer need to be visible, skip rendering altogether
  if (!shouldRender) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Background overlay that fades in/out */}
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim },
        ]}
      />

      {/* Modal content that slides up/down */}
      <Animated.View
        style={[styles.content, { transform: [{ translateY: slideAnim }] }]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    height: "60%",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});
