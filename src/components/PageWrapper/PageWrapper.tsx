import { ReactNode } from "react";
import { SafeAreaView, StatusBar, StatusBarStyle, StyleSheet } from "react-native";

type PageWrapperProps = {
    children: ReactNode;
    barStyle?: StatusBarStyle
}

/**
 * A wrapper component that provides a consistent layout for pages.
 *
 * @param {React.ReactNode} children - The content to be wrapped by this component.
 * @param {string} color - The background color for the wrapper.
 * @param {'default' | 'light-content' | 'dark-content'} [barStyle='default'] - The style of the status bar.
 * @returns {JSX.Element} The wrapped content with the specified background color and status bar style.
 */
export function PageWrapper({ children, barStyle = 'default' }: PageWrapperProps) {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={barStyle} backgroundColor={'black'} />
            {children}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});