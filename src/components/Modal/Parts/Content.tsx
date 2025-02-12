import { StyleSheet, View } from "react-native";

type ModalContentProps = {
  children: React.ReactNode;
};
export function ModalContent({ children }: ModalContentProps) {
  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
