package com.report.service;

import com.report.model.User;
import com.report.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    public User login(String username, String password) {
        return repo.findByUsernameAndPassword(username, password);
    }
}
