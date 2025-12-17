package com.community.profession_connect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ProfessionConnectApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProfessionConnectApplication.class, args);
	}

}
