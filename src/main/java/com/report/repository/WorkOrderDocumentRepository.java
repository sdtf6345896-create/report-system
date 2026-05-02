package com.report.repository;

import com.report.model.WorkOrderDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkOrderDocumentRepository extends JpaRepository<WorkOrderDocument, Long> {
    List<WorkOrderDocument> findByProductNo(String productNo);
    List<WorkOrderDocument> findByProductNoAndProcessNo(String productNo, String processNo);
    List<WorkOrderDocument> findByProductNoAndProcessNoAndDocType(String productNo, String processNo, String docType);
}