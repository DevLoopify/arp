import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

const utilityIcons: Record<string, IconName> = {
    wifi: 'wifi-outline',
    'power outlets': 'flash-outline',
    coffee: 'cafe-outline',
    printer: 'print-outline',
    'quiet zones': 'volume-mute-outline',
    restrooms: 'body-outline',
    'drinking water': 'water-outline',
    'public transit': 'bus-outline',
    benches: 'leaf-outline',
    microwave: 'restaurant-outline',
};

const fallbackIcon: IconName = 'checkmark-circle-outline';

export function getUtilityIcon(utility: string): IconName {
    return utilityIcons[utility.toLowerCase()] ?? fallbackIcon;
}

export default utilityIcons;
