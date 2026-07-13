import { useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    Pressable,
    StyleSheet
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function ProfilePicture({ uri }) {
  const [opened, setOpened] = useState(false);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const openImage = () => {
    scale.value = withTiming(1, { duration: 250 });
    setOpened(true);
  };

  const closeImage = () => {
    setOpened(false);
    scale.value = 0.3;
  };

  return (
    <>
      {/* Small profile image */}
      <Pressable onPress={openImage}>
        <Image
          source={{ uri }}
          style={styles.avatar}
        />
      </Pressable>

      {/* Expanded image */}
      <Modal
        visible={opened}
        transparent
        animationType="fade"
        onRequestClose={closeImage}
      >
        <Pressable
          style={styles.overlay}
          onPress={closeImage}
        >
          <Animated.Image
            source={{ uri }}
            style={[
              styles.fullImage,
              animatedStyle,
            ]}
          />
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 192,
    height: 192,
    borderRadius: 96,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
  },
});