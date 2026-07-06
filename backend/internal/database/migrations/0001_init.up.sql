CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workplaces (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    utilities TEXT[] NOT NULL DEFAULT '{}',
    noise SMALLINT NOT NULL DEFAULT 0,
    images TEXT[] NOT NULL DEFAULT '{}',
    crowdedness TEXT NOT NULL DEFAULT 'empty',
    crowd_by_hour_average TEXT[] NOT NULL DEFAULT '{}',
    crowd_by_hour_today TEXT[] NOT NULL DEFAULT '{}',
    phone_number TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    owner_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    workplace_id INTEGER NOT NULL REFERENCES workplaces(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author TEXT NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reviews_workplace_id_idx ON reviews(workplace_id);

CREATE TABLE favourites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workplace_id INTEGER NOT NULL REFERENCES workplaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, workplace_id)
);
