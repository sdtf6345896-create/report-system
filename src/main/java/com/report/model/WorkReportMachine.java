package com.report.model;

import jakarta.persistence.*;

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

    public Long getId() { return id; }
    public void setId(Long v) { id = v; }
    public Long getReportId() { return reportId; }
    public void setReportId(Long v) { reportId = v; }
    public String getMachineCode() { return machineCode; }
    public void setMachineCode(String v) { machineCode = v; }
    public String getMachineTimeStart() { return machineTimeStart; }
    public void setMachineTimeStart(String v) { machineTimeStart = v; }
    public String getMachineTimeEnd() { return machineTimeEnd; }
    public void setMachineTimeEnd(String v) { machineTimeEnd = v; }
}