package com.codeb.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/brands")
@CrossOrigin(origins = "http://localhost:5173")
public class BrandController {

    private final BrandRepository brandRepository;
    private final CustomerChainRepository chainRepository;

    public BrandController(
            BrandRepository brandRepository,
            CustomerChainRepository chainRepository) {
        this.brandRepository = brandRepository;
        this.chainRepository = chainRepository;
    }

    @GetMapping
    public List<Brand> getBrands(
            @RequestParam(required = false) Integer chainId) {
        return chainId == null
                ? brandRepository.findAll()
                : brandRepository.findByChain_Id(chainId);
    }

    @PostMapping
    public ResponseEntity<?> addBrand(@RequestBody Map<String, Object> body) {
        String name = String.valueOf(body.getOrDefault("brandName", "")).trim();

        if (name.isEmpty() || body.get("chainId") == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Brand name and chain are required"));
        }

        Integer chainId;
        try {
            chainId = Integer.valueOf(body.get("chainId").toString());
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid chain ID"));
        }

        CustomerChain chain = chainRepository.findById(chainId).orElse(null);
        if (chain == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Customer chain not found"));
        }

        Brand brand = new Brand();
        brand.setBrandName(name);
        brand.setChain(chain);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(brandRepository.save(brand));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBrand(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {

        Brand brand = brandRepository.findById(id).orElse(null);
        if (brand == null) {
            return ResponseEntity.notFound().build();
        }

        if (body.get("brandName") != null) {
            String name = body.get("brandName").toString().trim();
            if (name.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Brand name is required"));
            }
            brand.setBrandName(name);
        }

        if (body.get("chainId") != null) {
            Integer chainId;
            try {
                chainId = Integer.valueOf(body.get("chainId").toString());
            } catch (NumberFormatException ex) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid chain ID"));
            }

            CustomerChain chain = chainRepository.findById(chainId).orElse(null);
            if (chain == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Customer chain not found"));
            }
            brand.setChain(chain);
        }

        return ResponseEntity.ok(brandRepository.save(brand));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Integer id) {
        if (!brandRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        brandRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}