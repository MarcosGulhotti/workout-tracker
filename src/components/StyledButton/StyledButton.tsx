import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { Icon } from "react-native-elements";

type StyledButtonProps = {
    text: string;
    onPress?: () => void;
    customStyles?: ViewStyle;
    showIcon?: boolean;
    iconName?: string;
    disabled?: boolean;
}

export function StyledButton({ text, onPress, customStyles, showIcon, iconName, disabled }: StyledButtonProps) {
    return (
        <TouchableOpacity style={{ ...styles.styledButton, ...customStyles }} onPress={onPress} disabled={disabled}>
            <View style={styles.styledContent}>
                {(showIcon && iconName) && <Icon name={iconName} size={15} />}
                <Text>{text}</Text>
                <Icon name='navigate-next' color='#1ABC9C' />
            </View>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    styledButton: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#d5d5d5',
        borderRadius: 5,
        width: '90%',
        maxHeight: 40,
        flex: 1,
    },
    styledContent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 20,
    },
})