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
    parking: 'car-outline',
    'bike parking': 'bicycle-outline',
    'outdoor seating': 'umbrella-outline',
    accessible: 'accessibility-outline',
    'air conditioning': 'snow-outline',
    heating: 'flame-outline',
    'natural light': 'sunny-outline',
    'meeting rooms': 'people-outline',
    lockers: 'lock-closed-outline',
    'vending machine': 'fast-food-outline',
    '24/7 access': 'time-outline',
    'monitors/screens': 'desktop-outline',
    spotless: 'sparkles-outline',
    'private workspace': 'person-circle-outline',
};

const fallbackIcon: IconName = 'checkmark-circle-outline';

export function getUtilityIcon(utility: string): IconName {
    return utilityIcons[utility.toLowerCase()] ?? fallbackIcon;
}

export default utilityIcons;
