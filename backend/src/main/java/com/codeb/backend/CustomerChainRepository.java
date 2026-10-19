
package com.codeb.backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerChainRepository extends JpaRepository<CustomerChain, Integer> {
    boolean existsByGstnIgnoreCase(String gstn);
    boolean existsByGstnIgnoreCaseAndIdNot(String gstn, Integer id);
}
