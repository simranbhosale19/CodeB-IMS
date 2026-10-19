
package com.codeb.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerGroupRepository
        extends JpaRepository<CustomerGroup, Integer> {

    Optional<CustomerGroup> findByGroupNameIgnoreCase(
            String groupName);

    boolean existsByGroupNameIgnoreCase(String groupName);

    boolean existsByGroupNameIgnoreCaseAndGroupIdNot(
            String groupName, Integer groupId);
}
