import Colors from '@/constants/Colors';
import floatingButtonStyle from '@/constants/floatingButtonStyle';
import { useRoulette } from '@/context/RouletteContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

export default function RouletteButton({ workplaceId, size = 20 }) {
    const { isInRoulette, toggleRoulette } = useRoulette();
    const inRoulette = isInRoulette(workplaceId);

    return (
        <Pressable style={floatingButtonStyle.button} onPress={() => toggleRoulette(workplaceId)} hitSlop={8}>
            <Ionicons
                name={inRoulette ? 'dice' : 'dice-outline'}
                size={size}
                color={inRoulette ? Colors.primary : Colors.textPrimary}
            />
        </Pressable>
    );
}
