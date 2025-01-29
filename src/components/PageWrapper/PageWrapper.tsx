import { NavigationOptions } from "@/screens";
import { ScreenNavigationProp } from "@/types/navigation";
import { PropsWithChildren } from "react";
import { SafeAreaView, StatusBar, StatusBarStyle, StyleSheet } from "react-native";
import { NavBar } from "../NavBar/NavBar";

type PageWrapperProps = {
    barStyle?: StatusBarStyle
    selectedButton: NavigationOptions;
    navigate: ScreenNavigationProp;
}

/**
 * A wrapper component that provides a consistent layout for pages.
 *
 * @param {React.ReactNode} children - The content to be wrapped by this component.
 * @param {string} color - The background color for the wrapper.
 * @param {'default' | 'light-content' | 'dark-content'} [barStyle='default'] - The style of the status bar.
 * @returns {JSX.Element} The wrapped content with the specified background color and status bar style.
 */
export function PageWrapper({ children, selectedButton, navigate, barStyle = 'default' }: PropsWithChildren<PageWrapperProps>) {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={barStyle} backgroundColor={'black'} />
            {children}
            <NavBar selectedButton={selectedButton} handleNavigate={(options) => navigate.navigate(options)} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});