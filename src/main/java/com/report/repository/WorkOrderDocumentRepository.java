package com.report.repository;

import com.report.model.WorkOrderDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkOrderDocumentRepository extends JpaRepository<WorkOrderDocument, Long> {
    List<WorkOrderDocument> findByOrderNo(String orderNo);
    List<WorkOrderDocument> findByOrderNoAndProcessNo(String orderNo, String processNo);
    List<WorkOrderDocument> findByOrderNoAndProcessNoAndDocType(String orderNo, String processNo, String docType);
}