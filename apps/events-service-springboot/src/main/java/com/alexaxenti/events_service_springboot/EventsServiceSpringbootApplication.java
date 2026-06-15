package com.alexaxenti.events_service_springboot;

import com.alexaxenti.events_service_springboot.config.EventsProperties;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(EventsProperties.class)
public class EventsServiceSpringbootApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventsServiceSpringbootApplication.class, args);
	}

}
