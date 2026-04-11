package com.report.controller;

import com.report.model.User;
import com.report.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> body,
            HttpSession session) {

        String username = body.get("username");
        String password = body.get("password");

        User user = userService.login(username, password);
        Map<String, Object> result = new HashMap<>();

        if (user == null) {
            result.put("success", false);
            result.put("message", "帳號或密碼錯誤！");
            return ResponseEntity.ok(result);
        }

        session.setAttribute("user", user);
        result.put("success", true);
        result.put("role", user.getRole());
        result.put("employeeId", user.getEmployeeId());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("登出成功");
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> check(HttpSession session) {
        User user = (User) session.getAttribute("user");
        Map<String, Object> result = new HashMap<>();
        if (user == null) {
            result.put("loggedIn", false);
        } else {
            result.put("loggedIn", true);
            result.put("role", user.getRole());
            result.put("employeeId", user.getEmployeeId());
        }
        return ResponseEntity.ok(result);
    }

    @Autowired
    private com.report.repository.MachineRepository machineRepo2;
}