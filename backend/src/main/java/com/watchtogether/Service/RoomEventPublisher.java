package com.watchtogether.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoomEventPublisher {
    private final SimpMessagingTemplate messagingTemplate;

    public void participantJoined(String roomId, Object participantPayload) {
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId,
                new Event("participant_joined", participantPayload));
    }

    public void participantLeft(String roomId, String participantId) {
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId,
                new Event("participant_left", participantId));
    }

    public static final class Event {
        private final String type;
        private final Object payload;

        public Event(String type, Object payload) {
            this.type = type;
            this.payload = payload;
        }

        public String getType() {
            return type;
        }

        public Object getPayload() {
            return payload;
        }
    }
}