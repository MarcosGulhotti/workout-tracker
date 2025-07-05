import { NavigationOptions } from "@/screens";
import { ScreenNavigationProp } from "@/types/navigation";
import { PropsWithChildren } from "react";
import {
  SafeAreaView,
  StatusBar,
  StatusBarStyle,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Header, HeaderProps } from "../Header/Header";
import { NavBar } from "../NavBar/NavBar";
import { Overlay } from "../Overlay/Overlay";

export type PageWrapperProps = {
  barStyle?: StatusBarStyle;
  selectedButton: NavigationOptions;
  navigate: ScreenNavigationProp;
  hideNavBar?: boolean;
  headerProps?: Partial<HeaderProps>;
  hasBottomSheet?: boolean;
  closeBackdrop?: () => void;
};

/**
 * A wrapper component that provides a consistent layout for pages.
 *
 * @param {React.ReactNode} children - The content to be wrapped by this component.
 * @param {string} color - The background color for the wrapper.
 * @param {'default' | 'light-content' | 'dark-content'} [barStyle='default'] - The style of the status bar.
 * @returns {JSX.Element} The wrapped content with the specified background color and status bar style.
 */
export function PageWrapper({
  children,
  selectedButton,
  navigate,
  hideNavBar,
  headerProps,
  closeBackdrop,
  hasBottomSheet = false,
  barStyle = "default",
}: PropsWithChildren<PageWrapperProps>) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <Overlay
          visible={hasBottomSheet}
          onPress={() => {
            if (closeBackdrop) {
              closeBackdrop();
            }
          }}
        />
        <StatusBar barStyle={barStyle} />
        <Header navigate={navigate} {...headerProps} />
        <View style={styles.container}>{children}</View>
        {!hideNavBar && (
          <NavBar
            selectedButton={selectedButton}
            handleNavigate={(screen) => navigate.navigate(screen as any)}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
