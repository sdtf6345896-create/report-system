package com.report.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String employeeNo;
    private String employeeName;
    private Long deptId;
    private String hireDate;
    private String gender;
    private String position;
    private String phone;
    private String idNumber;
    private String emergencyContact;
    private String photo;
    private String emergencyPhone;
    private String emergencyRelation;
}