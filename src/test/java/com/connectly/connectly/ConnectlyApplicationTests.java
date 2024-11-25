package com.connectly.connectly;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = ConnectlyApplication.class)
@ActiveProfiles(value = "test")
class ConnectlyApplicationTests {

    @Test
    void contextLoads() {
    }

}
