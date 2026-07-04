import Colors from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

type CrowdLevel = { label: string; icon: ComponentProps<typeof Ionicons>['name']; color: string };

const crowdLevels: Record<string, CrowdLevel> = {
    empty: { label: 'Empty', icon: 'people-outline', color: Colors.crowdEmpty },
    slightly_crowded: { label: 'Slightly crowded', icon: 'people-outline', color: Colors.crowdSlight },
    medium_full: { label: 'Medium full', icon: 'people', color: Colors.crowdMedium },
    very_crowded: { label: 'Very crowded', icon: 'people', color: Colors.crowdHigh },
};

export default crowdLevels;
