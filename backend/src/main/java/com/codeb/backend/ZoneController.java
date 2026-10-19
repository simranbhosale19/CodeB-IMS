
package com.codeb.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/zones")
@CrossOrigin(origins = "http://localhost:5173")
public class ZoneController {

    private final ZoneRepository zoneRepository;
    private final BrandRepository brandRepository;

    public ZoneController(
            ZoneRepository zoneRepository,
            BrandRepository brandRepository) {
        this.zoneRepository = zoneRepository;
        this.brandRepository = brandRepository;
    }

    @GetMapping
    public List<Zone> getZones(
            @RequestParam(required = false) Integer brandId) {
        return brandId == null
                ? zoneRepository.findAll()
                : zoneRepository.findByBrand_Id(brandId);
    }

    @PostMapping
    public ResponseEntity<?> addZone(@RequestBody Map<String, Object> body) {
        String name = String.valueOf(
                body.getOrDefault("zoneName", "")).trim();

        if (name.isEmpty() || body.get("brandId") == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Zone name and brand are required"));
        }

        Integer brandId;
        try {
            brandId = Integer.valueOf(body.get("brandId").toString());
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid brand ID"));
        }

        Brand brand = brandRepository.findById(brandId).orElse(null);
        if (brand == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", "Brand not found"));
        }

        Zone zone = new Zone();
        zone.setZoneName(name);
        zone.setBrand(brand);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(zoneRepository.save(zone));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateZone(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {

        Zone zone = zoneRepository.findById(id).orElse(null);
        if (zone == null) {
            return ResponseEntity.notFound().build();
        }

        if (body.get("zoneName") != null) {
            String name = body.get("zoneName").toString().trim();
            if (name.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Zone name is required"));
            }
            zone.setZoneName(name);
        }

        if (body.get("brandId") != null) {
            Integer brandId;
            try {
                brandId = Integer.valueOf(body.get("brandId").toString());
            } catch (NumberFormatException ex) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Invalid brand ID"));
            }

            Brand brand = brandRepository.findById(brandId).orElse(null);
            if (brand == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        Map.of("message", "Brand not found"));
            }
            zone.setBrand(brand);
        }

        return ResponseEntity.ok(zoneRepository.save(zone));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteZone(@PathVariable Integer id) {
        if (!zoneRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        zoneRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
