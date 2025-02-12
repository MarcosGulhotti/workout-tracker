import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { TouchableOpacityProps } from "react-native-gesture-handler";

type StyledButtonProps = {
    text: string;
    onPress?: () => void;
    variant?: 'primary' | 'secondary';
} & TouchableOpacityProps;

export function StyledButton({ text, onPress, variant = 'primary', ...props }: StyledButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.styledButton, styles[variant]]}
            onPress={onPress}
            {...props}
        >
            <Text style={[styles.styledText, styles[`${variant}Text`]]}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    styledButton: {
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
    },
    styledText: {
        fontSize: 16,
        fontFamily: 'Lato',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    primary: {
        backgroundColor: '#00A8E8',
    },
    secondary: {
        backgroundColor: '#ECECEC',
    },
    primaryText: {
        color: 'white',
    },
    secondaryText: {
        color: '#333333',
    },
});
