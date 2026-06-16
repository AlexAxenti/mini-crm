package com.alexaxenti.events_service_springboot.events;

import com.alexaxenti.events_service_springboot.events.dto.CreateEventRequest;
import com.alexaxenti.events_service_springboot.events.dto.KafkaEventMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
@ConditionalOnProperty(prefix = "kafka", name = "enabled", havingValue = "true")
public class KafkaEventListener {
	private static final Logger logger = LoggerFactory.getLogger(KafkaEventListener.class);

	private final EventService eventService;
	private final ObjectMapper objectMapper;

	public KafkaEventListener(EventService eventService, ObjectMapper objectMapper) {
		this.eventService = eventService;
		this.objectMapper = objectMapper;
	}

	@KafkaListener(
			topics = "${kafka.events-topic}",
			groupId = "${kafka.events-consumer-group-id}"
	)
	public void listen(String message) {
		try {
			KafkaEventMessage event = objectMapper.readValue(message, KafkaEventMessage.class);

			if (
					isBlank(event.userId()) ||
					isBlank(event.type()) ||
					isBlank(event.entityType()) ||
					isBlank(event.entityId())
			) {
				logger.warn("Kafka event skipped because required fields are missing: {}", message);
				return;
			}

			eventService.createEvent(
					event.userId(),
					new CreateEventRequest(
							event.type(),
							event.entityType(),
							event.entityId(),
							event.meta()
					)
			);

			logger.info(
					"Kafka event saved: {} {} {}",
					event.type(),
					event.entityType(),
					event.entityId()
			);
		} catch (Exception exception) {
			logger.error(
					"Failed to save Kafka event message: {}",
					message,
					exception
			);
		}
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
