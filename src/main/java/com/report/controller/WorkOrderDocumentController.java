package com.report.controller;

import com.report.model.WorkOrderDocument;
import com.report.service.WorkOrderDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.ClassPathResource;
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

    // 查詢品號+工序的所有文件
    @GetMapping("/{productNo}/{processNo}")
    public List<WorkOrderDocument> getByProductAndProcess(
            @PathVariable String productNo,
            @PathVariable String processNo) {
        return svc.findByProductNoAndProcessNo(productNo, processNo);
    }

    // 查詢品號的所有文件
    @GetMapping("/{productNo}")
    public List<WorkOrderDocument> getByProductNo(@PathVariable String productNo) {
        return svc.findByProductNo(productNo);
    }

    // 取得圖片
    @GetMapping("/image/{fileName}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName) throws IOException {
        Path path = Paths.get(UPLOAD_DIR + fileName);
        Resource resource = new UrlResource(path.toUri());
        if (resource.exists()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        }
        // fallback 到 static 資料夾
        Resource staticResource = new ClassPathResource("static/uploads/" + fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(staticResource);
    }
}