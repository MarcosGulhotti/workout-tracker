import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { ScreenNavigationProp } from "../../types/navigation";

type HeaderProps = {
    navigate: ScreenNavigationProp
    actionButtonIcon?: string
    handleClickActionButton?: () => void
    actionButtonColor?: string
}

export function Header({ navigate, actionButtonIcon, handleClickActionButton, actionButtonColor }: HeaderProps) {

    const canGoBack = useMemo(() => navigate.canGoBack(), [navigate]);

    return (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <Icon name={canGoBack ? 'navigate-before' : ''} color='#34495E' onPress={navigate.goBack} />
                <Text style={styles.headerText}>Workout Tracker</Text>
                <View style={{ width: 24 }}>
                    {actionButtonIcon &&
                        <Icon
                            name={actionButtonIcon}
                            color={actionButtonColor ?? '#34495E'}
                            onPress={handleClickActionButton}
                        />
                    }
                </View>
            </View>
        </View>
    )
}

export const styles = StyleSheet.create({
    header: {
        height: 35,
    },
    headerContent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 20,
    },
    headerText: {
        fontFamily: 'Roboto',
        fontSize: 20,
        color: '#34495E',
        fontWeight: 'bold',
    },
})
