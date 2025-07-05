import { NavigationOptions } from "@/screens";
import { ScreenNavigationProp } from "@/types/navigation";
import { PropsWithChildren, useEffect, useRef } from "react";
import {
  Animated,
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
  closeBackdrop: () => void;
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
  barStyle = "default",
  closeBackdrop,
}: PropsWithChildren<PageWrapperProps>) {
  const { modalOpen } = headerProps || {};

  const fadeAnim = useRef(new Animated.Value(modalOpen ? 1 : 0)).current;
  const navBarOpacity = useRef(new Animated.Value(modalOpen ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(navBarOpacity, {
      toValue: modalOpen ? 0 : 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: modalOpen ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <Overlay
          visible={modalOpen ?? false}
          onPress={closeBackdrop}
          style={{ zIndex: 2 }}
        />
        <StatusBar barStyle={barStyle} />
        <Header navigate={navigate} {...headerProps} />
        <View style={styles.container}>{children}</View>
        {!hideNavBar && (
          <Animated.View style={{ opacity: navBarOpacity }}>
            <NavBar
              selectedButton={selectedButton}
              handleNavigate={(screen) => navigate.navigate(screen as any)}
            />
          </Animated.View>
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
