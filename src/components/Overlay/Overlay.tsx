import React from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";

type OverlayProps = {
  visible: boolean;
  onPress: () => void;
};

export function Overlay({ visible, onPress }: OverlayProps) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        pointerEvents={visible ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFillObject,
          styles.overlay,
          !visible && styles.hidden,
        ]}
      />
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "#0000007f",
    zIndex: 2,
  },
  hidden: {
    backgroundColor: "transparent",
  },
});
