package com.report.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "work_report_machine")
public class WorkReportMachine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long reportId;
    private String machineCode;
    private String machineTimeStart;
    private String machineTimeEnd;
}