
package com.codeb.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ZoneRepository extends JpaRepository<Zone, Integer> {
    List<Zone> findByBrand_Id(Integer brandId);
}

