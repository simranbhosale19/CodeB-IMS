package com.codeb.backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EstimateRepository
        extends JpaRepository<Estimate, Long> {
}