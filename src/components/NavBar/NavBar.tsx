import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-elements";

type NavBarProps = {
    selectedButton?: number;
    handleNavigate?: (ind: number) => void;
};

export function NavBar({ handleNavigate, selectedButton = 1 }: NavBarProps) {
    const [selected, setSelected] = useState(selectedButton);

    const handlePress = (index: number) => {
        setSelected(index);
        handleNavigate && handleNavigate(index);
    };

    return (
        <View style={styles.container}>
            <View style={selected === 0 ? styles.selectedIcon : styles.iconContainer}>
                <Icon
                    name="add-circle-outline"
                    color="#FFFFFF"
                    size={50}
                    onPress={() => handlePress(0)}
                    accessible
                    accessibilityLabel="Add"
                />
            </View>
            <View style={selected === 1 ? styles.selectedIcon : styles.iconContainer}>
                <Icon
                    name="home"
                    color="#FFFFFF"
                    size={50}
                    onPress={() => handlePress(1)}
                    accessible
                    accessibilityLabel="Home"
                />
            </View>
            <View style={selected === 2 ? styles.selectedIcon : styles.iconContainer}>
                <Icon
                    name="list"
                    color="#FFFFFF"
                    size={50}
                    onPress={() => handlePress(2)}
                    accessible
                    accessibilityLabel="List"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#003459',
        borderRadius: 40,
        paddingVertical: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        marginTop: -10,
    },
});