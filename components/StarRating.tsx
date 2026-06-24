import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

function StarRating() {
  const [rating, setRating] = useState(1);

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={40}
            color="#FFD700"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
});

export default StarRating;