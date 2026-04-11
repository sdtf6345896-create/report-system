package com.report.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "work_report")
public class WorkReport {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 private String productionDate, employeeNo, workOrder, process, machineCode;
 private String laborTimeStart, laborTimeEnd, machineTimeStart, machineTimeEnd, remarks;
 private Integer plannedQty, completedQty, scrapQty;
 private Boolean isComplete;

 @Transient
 private String processCode;

 @Transient
 private List<WorkReportMachine> machineList;

 @Transient
 private String employeeName;
}