package com.report.model;
import jakarta.persistence.*;
@Entity @Table(name="work_report")
public class WorkReport {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
 private Long id;
 private String productionDate,employeeNo,workOrder,process,machineCode;
 private String laborTimeStart,laborTimeEnd,machineTimeStart,machineTimeEnd,remarks;
 private Integer plannedQty,completedQty,scrapQty;
 private Boolean isComplete;
 
 @Transient
 private String processCode;

 public String getProcessCode() { return processCode; }
 public void setProcessCode(String v) { processCode = v; }
 
 @Transient
 private java.util.List<com.report.model.WorkReportMachine> machineList;

 public java.util.List<com.report.model.WorkReportMachine> getMachineList() { return machineList; }
 public void setMachineList(java.util.List<com.report.model.WorkReportMachine> v) { machineList = v; }
 public Long getId(){return id;}
 public void setId(Long v){id=v;}
 public String getProductionDate(){return productionDate;}
 public void setProductionDate(String v){productionDate=v;}
 public String getEmployeeNo(){return employeeNo;}
 public void setEmployeeNo(String v){employeeNo=v;}
 public String getWorkOrder(){return workOrder;}
 public void setWorkOrder(String v){workOrder=v;}
 public String getProcess(){return process;}
 public void setProcess(String v){process=v;}
 public String getMachineCode(){return machineCode;}
 public void setMachineCode(String v){machineCode=v;}
 public Integer getPlannedQty(){return plannedQty;}
 public void setPlannedQty(Integer v){plannedQty=v;}
 public Integer getCompletedQty(){return completedQty;}
 public void setCompletedQty(Integer v){completedQty=v;}
 public Integer getScrapQty(){return scrapQty;}
 public void setScrapQty(Integer v){scrapQty=v;}
 public String getLaborTimeStart(){return laborTimeStart;}
 public void setLaborTimeStart(String v){laborTimeStart=v;}
 public String getLaborTimeEnd(){return laborTimeEnd;}
 public void setLaborTimeEnd(String v){laborTimeEnd=v;}
 public String getMachineTimeStart(){return machineTimeStart;}
 public void setMachineTimeStart(String v){machineTimeStart=v;}
 public String getMachineTimeEnd(){return machineTimeEnd;}
 public void setMachineTimeEnd(String v){machineTimeEnd=v;}
 public String getRemarks(){return remarks;}
 public void setRemarks(String v){remarks=v;}
 public Boolean getIsComplete(){return isComplete;}
 public void setIsComplete(Boolean v){isComplete=v;}
}