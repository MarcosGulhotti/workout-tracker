import { StyledButton } from "@/components/StyledButton/StyledButton";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-elements";
import { ActionButton, ModalFooterProps } from "../@types";
import { getIconColor, getIconStyle } from "../utils/variants";

/**
 * Renders a footer component for a modal that includes optional icon-based action buttons
 * and a primary button. The primary button is placed in the center, while the optional
 * action buttons are placed on the sides.
 *
 * @remarks
 * - The icon color and style are determined by the action button variant.
 * - If no action button is provided, a placeholder view is rendered instead.
 *
 * @param props - An object containing footer configuration.
 * @param props.actionButtons - An object with optional primary and secondary action buttons.
 * @param props.actionButtons.primary - An optional object representing the primary action button.
 * @param props.actionButtons.secondary - An optional object representing the secondary action button.
 * @param props.mainButton - An object representing the main button to be displayed in the center.
 *
 * @returns A JSX element that renders a footer area with action buttons and a central button.
 */
export function ModalFooter({ actionButtons, mainButton }: ModalFooterProps) {
  /**
   * Renders an icon or a placeholder view based on the provided ActionButton configuration.
   *
   * @remarks
   * If an ActionButton is passed, its icon name, color, size, and accessible properties are set.
   * Otherwise, a placeholder view is displayed with zero opacity.
   *
   * @param btn - The optional ActionButton object containing icon, variant, and onPress properties.
   * @returns A React component that renders an icon or a placeholder view.
   */
  const renderIcon = (btn?: ActionButton) => {
    return btn ? (
      <Icon
        name={btn.icon}
        color={getIconColor(btn.variant ?? "primary")}
        size={20}
        onPress={btn.onPress}
        accessible
        accessibilityLabel={btn.icon}
        containerStyle={[
          styles.customIcon,
          getIconStyle(btn.variant ?? "primary"),
        ]}
      />
    ) : (
      <View style={[styles.customIcon, { opacity: 0 }]} />
    );
  };

  return (
    <View style={styles.footer}>
      <View>{renderIcon(actionButtons?.primary)}</View>
      <View style={styles.buttonContainer}>
        <StyledButton
          text={mainButton.text}
          onPress={mainButton.onPress}
          variant={mainButton.variant}
        />
      </View>
      <View>{renderIcon(actionButtons?.secondary)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 20,
    backgroundColor: "white",
  },
  customIcon: {
    borderRadius: 15,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flex: 1,
  },
});
