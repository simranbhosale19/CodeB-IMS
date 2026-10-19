package com.codeb.backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "estimates")
public class Estimate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientName;
    private String chainName;
    private String serviceName;
    private int quantity;
    private double unitPrice;
    private double gstPercent;
    private String status;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Estimate() {}

    public Long getId() { return id; }
    public String getClientName() { return clientName; }
    public void setClientName(String v) { clientName = v; }
    public String getChainName() { return chainName; }
    public void setChainName(String v) { chainName = v; }
    public String getServiceName() { return serviceName; }
    public void setServiceName(String v) { serviceName = v; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int v) { quantity = v; }
    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double v) { unitPrice = v; }
    public double getGstPercent() { return gstPercent; }
    public void setGstPercent(double v) { gstPercent = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public double getSubtotal() {
        return quantity * unitPrice;
    }

    public double getTotalAmount() {
        double subtotal = getSubtotal();
        return subtotal + subtotal * gstPercent / 100.0;
    }
}