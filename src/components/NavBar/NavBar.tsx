import { NavigationOptions } from "@/screens";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-elements";

type NavBarProps = {
    selectedButton: NavigationOptions;
    handleNavigate?: (option: NavigationOptions) => void;
};

export function NavBar({ handleNavigate, selectedButton }: NavBarProps) {
    const handlePress = (index: NavigationOptions) => {
        handleNavigate && handleNavigate(index);
    };

    return (
        <View style={styles.container}>
            <View style={selectedButton === 'CreateWorkout' ? styles.selectedIcon : styles.iconContainer}>
                <Icon
                    name="add-circle-outline"
                    color="#FFFFFF"
                    size={50}
                    onPress={() => handlePress('CreateWorkout')}
                    accessible
                    accessibilityLabel="Add"
                />
            </View>
            <View style={selectedButton === 'Home' ? styles.selectedIcon : styles.iconContainer}>
                <Icon
                    name="home"
                    color="#FFFFFF"
                    size={50}
                    onPress={() => handlePress('Home')}
                    accessible
                    accessibilityLabel="Home"
                />
            </View>
            <View style={selectedButton === 'ListAllWorkouts' ? styles.selectedIcon : styles.iconContainer}>
                <Icon
                    name="list"
                    color="#FFFFFF"
                    size={50}
                    onPress={() => handlePress('ListAllWorkouts')}
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