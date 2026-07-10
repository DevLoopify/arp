export type WorkspaceDraft = {
    name: string;
    description: string;
    selectedUtilities: string[];
    workMode: string;
    photoUris: string[];
    markerCoordinate: { latitude: number; longitude: number } | null;
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
