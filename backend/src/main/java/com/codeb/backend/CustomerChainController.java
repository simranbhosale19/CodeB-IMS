
package com.codeb.backend;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/chains")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerChainController {
    private final CustomerChainRepository repository;

    public CustomerChainController(CustomerChainRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<CustomerChain> all() {
        return repository.findAll();
    }

    @PostMapping
    public CustomerChain add(@RequestBody CustomerChain chain) {
        validate(chain);
        if (repository.existsByGstnIgnoreCase(chain.getGstn().trim()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "GSTN already exists");
        chain.setCompanyName(chain.getCompanyName().trim());
        chain.setGstn(chain.getGstn().trim().toUpperCase());
        chain.setGroupName(chain.getGroupName().trim());
        return repository.save(chain);
    }

    @PutMapping("/{id}")
    public CustomerChain edit(@PathVariable Integer id, @RequestBody CustomerChain chain) {
        CustomerChain old = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chain not found"));
        validate(chain);
        if (repository.existsByGstnIgnoreCaseAndIdNot(chain.getGstn().trim(), id))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "GSTN already exists");
        old.setCompanyName(chain.getCompanyName().trim());
        old.setGstn(chain.getGstn().trim().toUpperCase());
        old.setGroupName(chain.getGroupName().trim());
        return repository.save(old);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Integer id) {
        if (!repository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chain not found");
        repository.deleteById(id);
        return Map.of("message", "Chain deleted");
    }

    private void validate(CustomerChain chain) {
        if (chain.getCompanyName() == null || chain.getCompanyName().isBlank()
            || chain.getGstn() == null || chain.getGstn().isBlank()
            || chain.getGroupName() == null || chain.getGroupName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All fields are required");
        }
        if (!Pattern.matches("[0-9A-Za-z]{15}", chain.getGstn().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "GSTN must contain 15 letters or numbers");
        }
    }
}
