package com.alexaxenti.events_service_springboot.events;

import com.alexaxenti.events_service_springboot.events.dto.CreateEventRequest;
import com.alexaxenti.events_service_springboot.events.dto.EventResponse;
import com.alexaxenti.events_service_springboot.events.dto.GetEventsQuery;
import com.alexaxenti.events_service_springboot.security.AuthorizedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {
    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventResponse> getEvents(
            @RequestAttribute(AuthorizedUser.REQUEST_ATTRIBUTE) String userId,
            @Valid @ModelAttribute GetEventsQuery query
    ) {
        return eventService.getEvents(userId, query);
    }

    @GetMapping("/{id}")
    public EventResponse getEvent(
            @RequestAttribute(AuthorizedUser.REQUEST_ATTRIBUTE) String userId,
            @PathVariable String id
    ) {
        return eventService.getEvent(userId, id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event with ID " + id + " not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(
            @RequestAttribute(AuthorizedUser.REQUEST_ATTRIBUTE) String userId,
            @Valid @RequestBody CreateEventRequest request
    ) {
        return eventService.createEvent(userId, request);
    }
}
