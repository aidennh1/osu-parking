import os
import requests
import psycopg2
import time
from datetime import datetime, timezone

DATABASE_URL = os.environ["DATABASE_URL"]  # Railway injects this automatically
API_URL = "https://content.osu.edu/v2/parking/garages/availability"


def init_db(conn):
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS garages (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                capacity INTEGER,
                link TEXT,
                building_number TEXT
            );

            CREATE TABLE IF NOT EXISTS readings (
                id SERIAL PRIMARY KEY,
                garage_id TEXT REFERENCES garages(id),
                occupied INTEGER,
                available INTEGER,
                occupancy_pct INTEGER,
                closed INTEGER,
                access_types TEXT,
                scraped_at TEXT,
                source_updated_at TEXT,
                day_of_week INTEGER,
                hour INTEGER
            );

            CREATE INDEX IF NOT EXISTS idx_readings_garage_time
                ON readings(garage_id, scraped_at);
        """)
    conn.commit()


def slugify(name):
    import re
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def fetch_and_store(conn):
    response = requests.get(API_URL, timeout=10)
    response.raise_for_status()
    data = response.json()

    garages = data["data"]["garages"]
    now = datetime.now(timezone.utc)
    scraped_at = now.isoformat()
    dow = now.isoweekday()
    hour = now.hour

    with conn.cursor() as cur:
        for g in garages:
            garage_id = slugify(g["name"])

            cur.execute("""
                INSERT INTO garages (id, name, capacity, link, building_number)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    capacity = excluded.capacity,
                    link = excluded.link
            """, (garage_id, g["name"], g["capacity"], g.get("link"), g.get("osuBuildingNumber")))

            cur.execute("""
                INSERT INTO readings
                    (garage_id, occupied, available, occupancy_pct, closed,
                     access_types, scraped_at, source_updated_at, day_of_week, hour)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                garage_id,
                g["count"],
                g["capacity"] - g["count"],
                g["percentage"],
                int(g["closed"]),
                ",".join(g.get("currentAccess", [])),
                scraped_at,
                g.get("lastUpdated"),
                dow,
                hour,
            ))

    conn.commit()
    print(f"[{scraped_at}] Stored {len(garages)} garages")


def main(poll_interval=300):
    conn = psycopg2.connect(DATABASE_URL)
    init_db(conn)

    print(f"Polling every {poll_interval}s. Ctrl+C to stop.")
    while True:
        try:
            fetch_and_store(conn)
        except Exception as e:
            print(f"Error: {e}")
            conn.rollback()  # important: a failed query leaves the transaction broken otherwise
        time.sleep(poll_interval)


if __name__ == "__main__":
    main()