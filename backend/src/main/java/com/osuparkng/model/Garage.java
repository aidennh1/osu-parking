package com.osuparkng.model;

import jakarta.persistence.*;

@Entity
@Table(name = "garages")
public class Garage {

    @Id
    private String id;

    private String name;
    private int capacity;
    private String link;

    @Column(name = "building_number")
    private String buildingNumber;

    public String getId() { return id; }
    public String getName() { return name; }
    public int getCapacity() { return capacity; }
    public String getLink() { return link; }
    public String getBuildingNumber() { return buildingNumber; }
}