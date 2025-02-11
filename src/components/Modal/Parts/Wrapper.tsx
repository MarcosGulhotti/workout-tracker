import { StyleSheet, View } from "react-native";

export function ModalWrapper({ children }: { children: React.ReactNode }) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    content: {
        backgroundColor: 'white',
        width: '100%',
        height: '60%',
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
    }
});