package com.report.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "work_order")
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String orderNo;
    private String productNo;
}