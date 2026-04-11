package com.report.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "work_order_document")
public class WorkOrderDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNo;
    private String processNo;
    private String docType;
    private String filePath;
}