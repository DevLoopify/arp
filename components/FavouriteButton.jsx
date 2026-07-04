import Colors from '@/constants/Colors';
import floatingButtonStyle from '@/constants/floatingButtonStyle';
import { useFavourites } from '@/context/FavouritesContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

export default function FavouriteButton({ workplaceId, size = 22 }) {
    const { isFavourite, toggleFavourite } = useFavourites();
    const favourited = isFavourite(workplaceId);

    return (
        <Pressable style={floatingButtonStyle.button} onPress={() => toggleFavourite(workplaceId)} hitSlop={8}>
            <Ionicons
                name={favourited ? 'heart' : 'heart-outline'}
                size={size}
                color={favourited ? Colors.live : Colors.textPrimary}
            />
        </Pressable>
    );
}
