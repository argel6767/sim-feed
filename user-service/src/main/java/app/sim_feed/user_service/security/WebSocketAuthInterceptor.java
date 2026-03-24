package app.sim_feed.user_service.security;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import com.clerk.backend_api.helpers.security.AuthenticateRequest;
import com.clerk.backend_api.helpers.security.models.AuthenticateRequestOptions;
import com.clerk.backend_api.helpers.security.models.RequestState;

import app.sim_feed.user_service.chats.ChatMemberRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final AuthenticateRequestOptions authenticateRequestOptions;
    private final ChatMemberRepository chatMemberRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            authenticateConnection(accessor);
        }

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            authorizeChatSubscription(accessor);
        }

        return message;
    }

    private void authenticateConnection(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new MessageDeliveryException("Missing or invalid Authorization header");
        }

        Map<String, List<String>> headers = Map.of("authorization", List.of(authHeader));
        try {
            RequestState requestState = AuthenticateRequest.authenticateRequest(headers, authenticateRequestOptions);
            if (requestState.isSignedIn()) {
                Claims claims = requestState.claims().get();
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    claims.getSubject(), null, Collections.emptyList()
                );
                accessor.setUser(auth);
            } else {
                throw new MessageDeliveryException("Authentication failed: user is not signed in");
            }
        } catch (MessageDeliveryException e) {
            throw e;
        } catch (Exception e) {
            throw new MessageDeliveryException("Authentication failed: " + e.getMessage());
        }
    }

    private void authorizeChatSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null || !destination.startsWith("/topic/chats/")) {
            return;
        }

        if (accessor.getUser() == null) {
            throw new MessageDeliveryException("Authentication required to subscribe to chat topics");
        }

        String userId = accessor.getUser().getName();
        String chatIdSegment = destination.substring("/topic/chats/".length()).split("/")[0];

        try {
            Long chatId = Long.parseLong(chatIdSegment);
            if (!chatMemberRepository.existsByChatIdAndUserClerkId(chatId, userId)) {
                throw new MessageDeliveryException("You are not a member of chat " + chatId);
            }
        } catch (NumberFormatException e) {
            throw new MessageDeliveryException("Invalid chat ID: " + chatIdSegment);
        }
    }
}
