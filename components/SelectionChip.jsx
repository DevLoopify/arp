import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SelectionChip({
  text,
  icon,
  selected,
  onPress = () => {},
  small = false,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected ? styles.selected : styles.unselected,
        small && styles.containerSmall,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={[styles.icon, small && styles.iconSmall]}>
          {icon}
        </View>
      )}

      <Text
        style={[
          styles.text,
          selected ? styles.selectedText : styles.unselectedText,
          small && styles.textSmall,
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

  containerSmall: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    margin: 3,
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

  iconSmall: {
    marginRight: 4,
  },

  text: {
    fontSize: 14,
    fontWeight: "500",
  },

  textSmall: {
    fontSize: 12,
  },

  selectedText: {
    color: "#FFFFFF",
  },

  unselectedText: {
    color: "#374151",
  },
});