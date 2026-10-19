
package com.codeb.backend;

import jakarta.persistence.*;

@Entity
@Table(name = "customer_chains")
public class CustomerChain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false, unique = true, length = 15)
    private String gstn;

    @Column(nullable = false)
    private String groupName;

    public CustomerChain() {}

    public Integer getId() { return id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getGstn() { return gstn; }
    public void setGstn(String gstn) { this.gstn = gstn; }
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
}
