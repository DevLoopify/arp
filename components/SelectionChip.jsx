import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SelectionChip({
  text,
  icon,
  selected,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected ? styles.selected : styles.unselected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={styles.icon}>
          {icon}
        </View>
      )}

      <Text
        style={[
          styles.text,
          selected ? styles.selectedText : styles.unselectedText,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },

  selected: {
    backgroundColor: "#2563EB",
  },

  unselected: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  icon: {
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    fontSize: 14,
    fontWeight: "500",
  },

  selectedText: {
    color: "#FFFFFF",
  },

  unselectedText: {
    color: "#374151",
  },
});