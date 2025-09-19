package com.watchtogether.Controller;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    private final DataSource dataSource;

    public HelloController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello, World!";
    }

    @GetMapping("/db-check")
    public String check() throws SQLException {
        try (Connection c = dataSource.getConnection()) {
            return c.isValid(2) ? "DB: OK" : "DB: FAIL";
        }
    }
}