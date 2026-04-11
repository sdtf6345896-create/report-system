package com.report.repository;

import com.report.model.WorkReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkReportRepository extends JpaRepository<WorkReport, Long> {
    List<WorkReport> findByProductionDate(String productionDate);
    List<WorkReport> findByProductionDateAndEmployeeNo(String productionDate, String employeeNo);
    @org.springframework.data.jpa.repository.Query(
    	    "SELECT wr, pm.processCode FROM WorkReport wr " +
    	    "LEFT JOIN ProcessMaster pm ON wr.process = pm.processNo AND pm.orderNo = wr.workOrder " +
    	    "WHERE wr.productionDate = :date"
    	)
    	List<Object[]> findByDateWithProcessCode(@org.springframework.data.repository.query.Param("date") String date);

    	@org.springframework.data.jpa.repository.Query(
    	    "SELECT wr, pm.processCode FROM WorkReport wr " +
    	    "LEFT JOIN ProcessMaster pm ON wr.process = pm.processNo AND pm.orderNo = wr.workOrder " +
    	    "WHERE wr.productionDate = :date AND wr.employeeNo = :empNo"
    	)
    	List<Object[]> findByDateAndEmployeeWithProcessCode(
    	    @org.springframework.data.repository.query.Param("date") String date,
    	    @org.springframework.data.repository.query.Param("empNo") String empNo);

		List<WorkReport> findByEmployeeNoIn(List<String> employeeNos);

		List<WorkReport> findByEmployeeNoInAndProductionDate(List<String> employeeNos, String date);

		@Query("SELECT wr, pm.processCode FROM WorkReport wr " +
				"LEFT JOIN ProcessMaster pm ON wr.process = pm.processNo AND pm.orderNo = wr.workOrder " +
				"WHERE wr.employeeNo IN :empNos")
		List<Object[]> findByEmployeeNoInWithProcessCode(@Param("empNos") List<String> empNos);

		@Query("SELECT wr, pm.processCode FROM WorkReport wr " +
				"LEFT JOIN ProcessMaster pm ON wr.process = pm.processNo AND pm.orderNo = wr.workOrder " +
				"WHERE wr.employeeNo IN :empNos AND wr.productionDate = :date")
		List<Object[]> findByEmployeeNoInAndDateWithProcessCode(@Param("empNos") List<String> empNos, @Param("date") String date);
	}