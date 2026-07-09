import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type StarRatingProps = {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
};

function StarRating({ rating: ratingProp = 1, onRatingChange, size = 40 }: StarRatingProps) {
  const [rating, setRating] = useState(ratingProp);

  useEffect(() => {
    setRating(ratingProp);
  }, [ratingProp]);

  const handlePress = (value: number) => {
    setRating(value);
    onRatingChange?.(value);
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => handlePress(star)} activeOpacity={0.7} hitSlop={6}>
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={star <= rating ? "#FFD700" : "#D1D5DB"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
  },
});

export default StarRating;