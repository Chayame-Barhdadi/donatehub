package com.donatehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class DonateHubApplication {

	public static void main(String[] args) {
		SpringApplication.run(DonateHubApplication.class, args);
	}

}
