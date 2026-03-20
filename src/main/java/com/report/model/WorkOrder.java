package com.report.model;

import jakarta.persistence.*;

@Entity
@Table(name = "work_order")
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String orderNo;
    private String productNo;

    public Long getId() { return id; }
    public void setId(Long v) { id = v; }
    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String v) { orderNo = v; }
    public String getProductNo() { return productNo; }
    public void setProductNo(String v) { productNo = v; }
}