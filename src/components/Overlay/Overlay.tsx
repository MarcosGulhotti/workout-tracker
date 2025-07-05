import React from "react";
import {
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from "react-native";

type OverlayProps = {
  visible: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export function Overlay({ visible, onPress, style }: OverlayProps) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        pointerEvents={visible ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFillObject,
          styles.overlay,
          style,
          !visible && styles.hidden,
        ]}
      />
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "#0000007f",
  },
  hidden: {
    backgroundColor: "transparent",
  },
});
