package com.osuparkng.service;

import com.osuparkng.model.Garage;
import com.osuparkng.model.GarageReading;
import com.osuparkng.repository.GarageReadingRepository;
import com.osuparkng.repository.GarageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkingService {

    private final GarageRepository garageRepo;
    private final GarageReadingRepository readingRepo;

    public ParkingService(GarageRepository garageRepo, GarageReadingRepository readingRepo) {
        this.garageRepo = garageRepo;
        this.readingRepo = readingRepo;
    }

    public List<GarageReading> getCurrentCapacity() {
        return readingRepo.findLatestPerGarage();
    }

    public List<GarageReading> getHistory(String garageId, int hours) {
        return readingRepo.findHistory(garageId, String.format("-%d hours", hours));
    }

    public List<Garage> getAllGarages() {
        return garageRepo.findAll();
    }
}