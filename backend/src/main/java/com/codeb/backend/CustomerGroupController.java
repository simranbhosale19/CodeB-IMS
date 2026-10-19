
package com.codeb.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class CustomerGroupController {

    private final CustomerGroupRepository repository;

    public CustomerGroupController(
            CustomerGroupRepository repository) {
        this.repository = repository;
    }

    // View all groups
    @GetMapping
    public List<CustomerGroup> getAllGroups() {
        return repository.findAll();
    }

    // Add a new group
    @PostMapping
    public ResponseEntity<?> addGroup(
            @RequestBody Map<String, String> body) {

        String name = body.get("groupName");

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Group name is required."));
        }

        name = name.trim();

        if (repository.existsByGroupNameIgnoreCase(name)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message",
                            "Group name already exists."));
        }

        CustomerGroup group = new CustomerGroup();
        group.setGroupName(name);
        group.setActive(true);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(repository.save(group));
    }

    // Edit a group
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGroup(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {

        CustomerGroup group = repository.findById(id)
                .orElse(null);

        if (group == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Group not found."));
        }

        String name = body.get("groupName");

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Group name is required."));
        }

        name = name.trim();

        if (repository.existsByGroupNameIgnoreCaseAndGroupIdNot(
                name, id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message",
                            "Group name already exists."));
        }

        group.setGroupName(name);
        return ResponseEntity.ok(repository.save(group));
    }

    // Soft-delete a group
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateGroup(
            @PathVariable Integer id) {

        CustomerGroup group = repository.findById(id)
                .orElse(null);

        if (group == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Group not found."));
        }

        group.setActive(false);
        repository.save(group);

        return ResponseEntity.ok(
                Map.of("message",
                        "Group deactivated successfully."));
    }

    // Activate or deactivate a group
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> changeStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> body) {

        CustomerGroup group = repository.findById(id)
                .orElse(null);

        if (group == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Group not found."));
        }

        Boolean active = body.get("active");

        if (active == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Active status is required."));
        }

        group.setActive(active);
        return ResponseEntity.ok(repository.save(group));
    }
}
