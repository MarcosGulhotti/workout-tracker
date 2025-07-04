import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const screenHeight = Dimensions.get("window").height;

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
 */
export function ModalWrapper({
  children,
  visible = true,
  onClose,
}: ModalWrapperProps) {
  const [shouldRender, setShouldRender] = useState(visible);

  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
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
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
        onClose?.();
      });
    }
  }, [visible, fadeAnim, slideAnim, onClose]);

  if (!shouldRender) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: 100 }]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[styles.overlay, { opacity: fadeAnim }]} // background fade
        onTouchEnd={onClose}
        {...{
          onStartShouldSetResponder: () => true,
          onResponderMove: (e) => {
            if (e.nativeEvent.locationY > 50) {
              onClose?.();
            }
          },
        }}
      />

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
    backgroundColor: "#0000007f",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    height: "85%",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});
