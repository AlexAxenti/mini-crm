package com.alexaxenti.events_service_springboot.events;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "kafka", name = "enabled", havingValue = "true")
public class KafkaSmokeListener {
	private static final Logger logger = LoggerFactory.getLogger(KafkaSmokeListener.class);

	@KafkaListener(topics = "${kafka.topic}", groupId = "${kafka.smoke-consumer-group-id}")
	public void listen(String message) {
		logger.info("Kafka smoke message received: {}", message);
	}
}
