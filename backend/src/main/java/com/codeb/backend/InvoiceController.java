package com.codeb.backend;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    private final InvoiceRepository invoices;
    private final EstimateRepository estimates;

    public InvoiceController(
            InvoiceRepository invoices,
            EstimateRepository estimates) {
        this.invoices = invoices;
        this.estimates = estimates;
    }

    @GetMapping
    public List<Invoice> getAll() {
        return invoices.findAll();
    }

    @GetMapping("/estimate/{estimateId}")
    public List<Invoice> getByEstimate(
            @PathVariable Long estimateId) {
        return invoices.findByEstimatedId(estimateId);
    }

    @PostMapping("/from-estimate/{estimateId}")
    public Invoice createFromEstimate(
            @PathVariable Long estimateId) {

        Estimate estimate = estimates.findById(estimateId)
            .orElseThrow(() ->
                new RuntimeException("Estimate not found"));

        Invoice invoice = new Invoice();
        invoice.setEstimatedId(estimate.getId());
        invoice.setClientName(estimate.getClientName());
        invoice.setChainName(estimate.getChainName());
        invoice.setServiceName(estimate.getServiceName());
        invoice.setQuantity(estimate.getQuantity());
        invoice.setUnitPrice(estimate.getUnitPrice());
        invoice.setGstPercent(estimate.getGstPercent());
        invoice.setStatus("Generated");

        return invoices.save(invoice);
    }
}