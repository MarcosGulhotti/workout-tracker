import React, { useMemo } from "react";
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { ScreenNavigationProp } from "../../types/navigation";

type HeaderProps = {
    navigate: ScreenNavigationProp;
    actionButtonIcon?: string;
    handleClickActionButton?: () => void;
    actionButtonColor?: string;
};

export function Header({ navigate, actionButtonIcon, handleClickActionButton, actionButtonColor }: HeaderProps) {
    const canGoBack = useMemo(() => navigate.canGoBack(), [navigate]);

    return (
        <>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />

            <View style={styles.dynamicIslandBackground} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        {canGoBack ? (
                            <Icon
                                name="navigate-before"
                                color="#FFFFFF"
                                size={28}
                                onPress={navigate.goBack}
                            />
                        ) : (
                            <View style={{ width: 28 }} />
                        )}

                        <Text style={styles.headerText}>Workout Tracker</Text>
                        <View style={{ width: 28 }}>
                            {actionButtonIcon && (
                                <Icon
                                    name={actionButtonIcon}
                                    color={actionButtonColor ?? '#FFFFFF'}
                                    size={24}
                                    onPress={handleClickActionButton}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    dynamicIslandBackground: {
        height: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight, //TODO Test in android
        backgroundColor: '#003459',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: -1,
    },
    safeArea: {
        backgroundColor: '#003459',
        flex: 0,
    },
    header: {
        backgroundColor: '#003459',
        height: 60,
        justifyContent: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        flex: 1,
    },
    headerText: {
        fontFamily: 'Montserrat',
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});
