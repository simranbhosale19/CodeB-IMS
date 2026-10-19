package com.codeb.backend;

import jakarta.persistence.*;

@Entity
@Table(name = "brands")
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "brand_name", nullable = false)
    private String brandName;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "chain_id", nullable = false)
    private CustomerChain chain;

    public Brand() {}

    public Integer getId() {
        return id;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public CustomerChain getChain() {
        return chain;
    }

    public void setChain(CustomerChain chain) {
        this.chain = chain;
    }
}