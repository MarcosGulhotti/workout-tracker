import { StyledButtonProps } from "@/components/StyledButton/StyledButton";

type ActionButton = {
  icon: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
};

type ModalFooterProps = {
  actionButtons?: {
    primary?: ActionButton;
    secondary?: ActionButton;
  };
  mainButton: StyledButtonProps;
};

export type { ActionButton, ModalFooterProps };
