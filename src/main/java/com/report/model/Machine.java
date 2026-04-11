package com.report.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "machine")
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String machineCode;
    private String processType;
    private String machineType;
}