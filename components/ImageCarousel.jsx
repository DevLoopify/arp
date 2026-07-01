import Colors from '@/constants/Colors';
import { useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';

export default function ImageCarousel({ images, width }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = (e) => {
        if (width > 0) {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
        }
    };

    return (
        <View>
            <FlatList
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                    <Image
                        source={{ uri: item }}
                        style={{ width, height: 220 }}
                        resizeMode="cover"
                    />
                )}
            />
            {images.length > 1 && (
                <View style={styles.dots}>
                    {images.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, i === activeIndex && styles.dotActive]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    dots: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    dotActive: {
        backgroundColor: Colors.backgroundWhite,
        width: 18,
    },
});