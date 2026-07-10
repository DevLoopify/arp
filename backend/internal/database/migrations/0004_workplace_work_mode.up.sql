ALTER TABLE workplaces
    ADD COLUMN work_mode TEXT NOT NULL DEFAULT 'both',
    ADD CONSTRAINT workplaces_work_mode_check CHECK (work_mode IN ('solo', 'group', 'both'));
