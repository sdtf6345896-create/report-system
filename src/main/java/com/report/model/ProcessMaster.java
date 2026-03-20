package com.report.model;

import jakarta.persistence.*;

@Entity
@Table(name = "process_master")
public class ProcessMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String processNo;
    private String processCode;
    private String orderNo;

    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String v) { orderNo = v; }

    public Long getId() { return id; }
    public void setId(Long v) { id = v; }
    public String getProcessNo() { return processNo; }
    public void setProcessNo(String v) { processNo = v; }
    public String getProcessCode() { return processCode; }
    public void setProcessCode(String v) { processCode = v; }
}