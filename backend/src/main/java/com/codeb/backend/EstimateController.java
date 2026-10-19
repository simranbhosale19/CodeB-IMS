package com.codeb.backend;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/estimates")
@CrossOrigin(origins = "http://localhost:5173")
public class EstimateController {

    private final EstimateRepository repository;

    public EstimateController(EstimateRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Estimate> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Estimate create(@RequestBody Estimate estimate) {
        if (estimate.getQuantity() < 1 ||
            estimate.getUnitPrice() < 0 ||
            estimate.getGstPercent() < 0) {
            throw new IllegalArgumentException("Invalid estimate values");
        }

        if (estimate.getStatus() == null ||
            estimate.getStatus().isBlank()) {
            estimate.setStatus("Draft");
        }

        return repository.save(estimate);
    }

    @PutMapping("/{id}")
    public Estimate update(@PathVariable Long id,
                           @RequestBody Estimate updated) {
        Estimate existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Estimate not found"));

        existing.setClientName(updated.getClientName());
        existing.setChainName(updated.getChainName());
        existing.setServiceName(updated.getServiceName());
        existing.setQuantity(updated.getQuantity());
        existing.setUnitPrice(updated.getUnitPrice());
        existing.setGstPercent(updated.getGstPercent());
        existing.setStatus(updated.getStatus());

        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}