package com.codeb.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository
        extends JpaRepository<Invoice, Long> {

    List<Invoice> findByEstimatedId(Long estimatedId);
}
