ALTER TABLE users
    ALTER COLUMN noise_level DROP DEFAULT;

ALTER TABLE users
    ALTER COLUMN noise_level TYPE INTEGER USING (
        CASE noise_level
            WHEN 'quiet' THEN 2
            WHEN 'average' THEN 3
            WHEN 'noisy' THEN 4
            ELSE 3
        END
    );

ALTER TABLE users
    ALTER COLUMN noise_level SET DEFAULT 3,
    ADD CONSTRAINT users_noise_level_check CHECK (noise_level BETWEEN 1 AND 5);
