package com.osuparkng.repository;

import com.osuparkng.model.GarageReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GarageReadingRepository extends JpaRepository<GarageReading, Long> {

    /** Latest reading per garage for the dashboard snapshot */
    @Query("""
        SELECT r FROM GarageReading r
        WHERE r.id IN (
            SELECT MAX(r2.id) FROM GarageReading r2
            GROUP BY r2.garageId
        )
        ORDER BY r.occupancyPct DESC
    """)
    List<GarageReading> findLatestPerGarage();

    /** Time-series history for one garage — native SQL so we can use SQLite's datetime() */
    @Query(value = """
        SELECT * FROM readings
        WHERE garage_id = :garageId
          AND scraped_at >= datetime('now', :offset)
        ORDER BY scraped_at ASC
    """, nativeQuery = true)
    List<GarageReading> findHistory(
        @Param("garageId") String garageId,
        @Param("offset") String offset
    );
}