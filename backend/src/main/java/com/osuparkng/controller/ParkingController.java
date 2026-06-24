package com.osuparkng.controller;

import com.osuparkng.model.Garage;
import com.osuparkng.model.GarageReading;
import com.osuparkng.service.ParkingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/garages")
public class ParkingController {

    private final ParkingService parkingService;

    public ParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @GetMapping
    public List<GarageReading> getCurrentCapacity() {
        return parkingService.getCurrentCapacity();
    }

    @GetMapping("/meta")
    public List<Garage> getGarageMetadata() {
        return parkingService.getAllGarages();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<GarageReading>> getHistory(
            @PathVariable String id,
            @RequestParam(defaultValue = "24") int hours) {

        if (hours < 1 || hours > 168) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(parkingService.getHistory(id, hours));
    }
}