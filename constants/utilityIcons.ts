import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

const utilityIcons: Record<string, IconName> = {
    // High priority: essentials for working
    wifi: 'wifi-outline',
    'power outlets': 'flash-outline',
    'quiet zones': 'volume-mute-outline',
    restrooms: 'body-outline',
    'drinking water': 'water-outline',
    '24/7 access': 'time-outline',
    accessible: 'accessibility-outline',

    // Medium priority: comfort and convenience
    coffee: 'cafe-outline',
    printer: 'print-outline',
    'meeting rooms': 'people-outline',
    'monitors/screens': 'desktop-outline',
    lockers: 'lock-closed-outline',
    'air conditioning': 'snow-outline',
    heating: 'flame-outline',
    'public transit': 'bus-outline',
    parking: 'car-outline',
    'bike parking': 'bicycle-outline',
    'private workspace': 'person-circle-outline',

    // Low priority: nice-to-haves
    'natural light': 'sunny-outline',
    'outdoor seating': 'umbrella-outline',
    benches: 'leaf-outline',
    microwave: 'restaurant-outline',
    'vending machine': 'fast-food-outline',
    spotless: 'sparkles-outline',
};

const fallbackIcon: IconName = 'checkmark-circle-outline';

export function getUtilityIcon(utility: string): IconName {
    return utilityIcons[utility.toLowerCase()] ?? fallbackIcon;
}

export default utilityIcons;
