package com.osuparkng.repository;

import com.osuparkng.model.Garage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GarageRepository extends JpaRepository<Garage, String> {}