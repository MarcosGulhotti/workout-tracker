type ActionButton = {
    icon: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "danger";
};

type ModalFooterProps = {
    actionButtons?: {
        primary?: ActionButton,
        secondary?: ActionButton,
    }
    mainButton: {
        text: string;
        onPress: () => void;
    }
};

export type { ActionButton, ModalFooterProps };
