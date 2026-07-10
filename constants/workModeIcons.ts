import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type WorkMode = 'solo' | 'group' | 'both';

const workModeIcons: Record<WorkMode, IconName> = {
    solo: 'person-outline',
    group: 'people-outline',
    both: 'people-circle-outline',
};

const workModeLabels: Record<WorkMode, string> = {
    solo: 'Solo Work',
    group: 'Group Work',
    both: 'Solo & Group',
};

export function getWorkModeIcon(workMode: string): IconName {
    return workModeIcons[workMode as WorkMode] ?? workModeIcons.both;
}

export function getWorkModeLabel(workMode: string): string {
    return workModeLabels[workMode as WorkMode] ?? workModeLabels.both;
}

export default workModeIcons;
