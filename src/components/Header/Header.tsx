import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { ScreenNavigationProp } from "../../types/navigation";

type HeaderProps = {
    navigate: ScreenNavigationProp
    showAddButton?: boolean
}

export function Header({ navigate, showAddButton }: HeaderProps) {

    const canGoBack = useMemo(() => navigate.canGoBack(), [navigate]);

    return (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                {canGoBack &&
                    <Icon name='navigate-before' color='#34495E' onPress={navigate.goBack} />
                }
                <Text style={styles.headerText}>Workout Tracker</Text>
                <Icon
                    name={showAddButton ? 'add-circle' : ''}
                    color='#34495E'
                    onPress={() => navigate.navigate('CreateWorkout')}
                />
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
