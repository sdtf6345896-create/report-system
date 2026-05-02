package com.report.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "process_master")
public class ProcessMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String processNo;
    private String processCode;
    private String productNo;
    private String processName;
    private String reviewedBy;
}