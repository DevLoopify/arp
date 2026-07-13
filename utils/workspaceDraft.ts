import { Coordinate } from '@/utils/geo';

export type WorkspaceDraft = {
    name: string;
    description: string;
    selectedUtilities: string[];
    workMode: string;
    opensAt: string | null;
    closesAt: string | null;
    photoUris: string[];
    markerCoordinate: Coordinate | null;
};

let draft: WorkspaceDraft | null = null;

export function getWorkspaceDraft(): WorkspaceDraft | null {
    return draft;
}

export function saveWorkspaceDraft(value: WorkspaceDraft) {
    draft = value;
}

export function clearWorkspaceDraft() {
    draft = null;
}
