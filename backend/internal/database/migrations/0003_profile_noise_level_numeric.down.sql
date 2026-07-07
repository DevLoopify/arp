ALTER TABLE users
    DROP CONSTRAINT users_noise_level_check;

ALTER TABLE users
    ALTER COLUMN noise_level DROP DEFAULT;

ALTER TABLE users
    ALTER COLUMN noise_level TYPE TEXT USING (
        CASE
            WHEN noise_level <= 2 THEN 'quiet'
            WHEN noise_level = 3 THEN 'average'
            ELSE 'noisy'
        END
    );

ALTER TABLE users
    ALTER COLUMN noise_level SET DEFAULT 'average';
