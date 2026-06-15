package com.alexaxenti.events_service_springboot.events;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "\"Event\"")
public class Event {
    @Id
    @Column(name = "\"id\"", nullable = false)
    private String id;

    @Column(name = "\"userId\"", nullable = false)
    private String userId;

    @Column(name = "\"type\"", nullable = false)
    private String type;

    @Column(name = "\"entityType\"", nullable = false)
    private String entityType;

    @Column(name = "\"entityId\"", nullable = false)
    private String entityId;

    @Column(name = "\"createdAt\"", nullable = false)
    private Instant createdAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "\"meta\"", columnDefinition = "jsonb")
    private Map<String, Object> meta;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = Cuid.create();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Map<String, Object> getMeta() {
        return meta;
    }

    public void setMeta(Map<String, Object> meta) {
        this.meta = meta;
    }
}
