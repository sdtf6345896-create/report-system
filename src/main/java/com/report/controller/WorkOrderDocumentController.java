package com.report.controller;

import com.report.model.WorkOrderDocument;
import com.report.service.WorkOrderDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@RestController
@RequestMapping("/api/document")
@CrossOrigin(origins = "*")
public class WorkOrderDocumentController {

    @Autowired
    private WorkOrderDocumentService svc;

    private final String UPLOAD_DIR = "uploads/";

    // 查詢製令+工序的所有文件
    @GetMapping("/{orderNo}/{processNo}")
    public List<WorkOrderDocument> getByOrderAndProcess(
            @PathVariable String orderNo,
            @PathVariable String processNo) {
        return svc.findByOrderNoAndProcessNo(orderNo, processNo);
    }

    // 查詢製令的所有文件
    @GetMapping("/{orderNo}")
    public List<WorkOrderDocument> getByOrderNo(@PathVariable String orderNo) {
        return svc.findByOrderNo(orderNo);
    }

    // 取得圖片
    @GetMapping("/image/{fileName}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName) throws IOException {
        Path path = Paths.get(UPLOAD_DIR + fileName);
        Resource resource = new UrlResource(path.toUri());
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
}