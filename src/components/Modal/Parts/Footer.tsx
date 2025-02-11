import { StyledButton } from "@/components/StyledButton/StyledButton";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-elements";

type ActionButton = {
    icon: string;
    onPress: () => void;
};

type ModalFooterProps = {
    actionButtons: {
        primary: ActionButton | null,
        secondary: ActionButton | null,
    }
    mainButton: {
        text: string;
        onPress: () => void;
    }
};

export function ModalFooter({ actionButtons: { primary, secondary }, mainButton }: ModalFooterProps) {
    return (
        <View style={styles.footer}>
            <View>
                {primary && (
                    <Icon
                        name={primary.icon}
                        color="blue"
                        size={30}
                        onPress={primary.onPress}
                        accessible
                        accessibilityLabel="Close"
                    />
                )}
            </View>
            <View>
                <StyledButton
                    text={mainButton.text}
                    onPress={mainButton.onPress}
                />
            </View>
            <View>
                {secondary && (
                    <Icon
                        name={secondary.icon}
                        color="blue"
                        size={30}
                        onPress={secondary.onPress}
                        accessible
                        accessibilityLabel="Close"
                    />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "rgb(0, 0, 0, 0.25)",
    },
});