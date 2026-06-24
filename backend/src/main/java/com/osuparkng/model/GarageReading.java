package com.osuparkng.model;

import jakarta.persistence.*;

@Entity
@Table(name = "readings")
public class GarageReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "garage_id")
    private String garageId;

    private int occupied;
    private int available;

    @Column(name = "occupancy_pct")
    private double occupancyPct;

    private int closed;

    @Column(name = "access_types")
    private String accessTypes;

    @Column(name = "scraped_at")
    private String scrapedAt;

    @Column(name = "source_updated_at")
    private String sourceUpdatedAt;

    @Column(name = "day_of_week")
    private int dayOfWeek;

    @Column(name = "hour")
    private int hour;

    public Long getId() { return id; }
    public String getGarageId() { return garageId; }
    public int getOccupied() { return occupied; }
    public int getAvailable() { return available; }
    public double getOccupancyPct() { return occupancyPct; }
    public int getClosed() { return closed; }
    public String getAccessTypes() { return accessTypes; }
    public String getScrapedAt() { return scrapedAt; }
    public String getSourceUpdatedAt() { return sourceUpdatedAt; }
    public int getDayOfWeek() { return dayOfWeek; }
    public int getHour() { return hour; }
}