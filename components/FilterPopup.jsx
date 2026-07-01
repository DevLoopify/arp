import { Ionicons } from "@expo/vector-icons"
import { useRef } from "react"
import { Modal, PanResponder, Pressable, StyleSheet, Text, View } from "react-native"

export default function FilterPopup({ visible, onClose }) {
    const panResponder = useRef(
    PanResponder.create({
  onStartShouldSetPanResponder: () => true,
  onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
  onPanResponderRelease: (_, g) => {
    if (g.dy > 80) onClose()
  },
})
    ).current
    return (
    <Modal visible={visible} transparent animationType="slide" >
        <View style={styles.overlay}>
            <View style={styles.sheet} >
            <View style={styles.handleArea} {...panResponder.panHandlers}>
                <View style={styles.handle} />
            </View>                
            <Pressable onPress={onClose}>
                    <Text>
                        <Ionicons name="close" size={24} />
                    </Text>
                </Pressable>
                <Text>Hello Worlds</Text>
            </View>
        </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
    overlay: {
  flex: 1,
  justifyContent: 'flex-end',  // Sheet von unten
},
sheet: {
  height: '93%',
  backgroundColor: 'white',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
},
handle: {
  width: 40,
  height: 4,
  backgroundColor: '#ccc',
  borderRadius: 2,
  alignSelf: 'center',
  marginTop: 8,
  marginBottom: 8,
},
handleArea: {
  width: '100%',
  paddingVertical: 16,
  alignItems: 'center',
}
})