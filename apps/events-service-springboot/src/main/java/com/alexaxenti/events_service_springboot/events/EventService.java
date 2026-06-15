package com.alexaxenti.events_service_springboot.events;

import com.alexaxenti.events_service_springboot.events.dto.CreateEventRequest;
import com.alexaxenti.events_service_springboot.events.dto.EventResponse;
import com.alexaxenti.events_service_springboot.events.dto.GetEventsQuery;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {
    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<EventResponse> getEvents(String userId, GetEventsQuery query) {
        Sort.Direction direction = "asc".equals(query.sortDirection()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return eventRepository.findAll(forUserAndQuery(userId, query), Sort.by(direction, "createdAt"))
                .stream()
                .map(EventService::toResponse)
                .toList();
    }

    public Optional<EventResponse> getEvent(String userId, String id) {
        return eventRepository.findByIdAndUserId(id, userId).map(EventService::toResponse);
    }

    public EventResponse createEvent(String userId, CreateEventRequest request) {
        Event event = new Event();
        event.setUserId(userId);
        event.setType(request.type());
        event.setEntityType(request.entityType());
        event.setEntityId(request.entityId());
        event.setMeta(request.meta());

        return toResponse(eventRepository.save(event));
    }

    private static Specification<Event> forUserAndQuery(String userId, GetEventsQuery query) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("userId"), userId));

            if (query.type() != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), query.type()));
            }
            if (query.entityType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("entityType"), query.entityType()));
            }
            if (query.entityId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("entityId"), query.entityId()));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getUserId(),
                event.getType(),
                event.getEntityType(),
                event.getEntityId(),
                event.getCreatedAt(),
                event.getMeta()
        );
    }
}
