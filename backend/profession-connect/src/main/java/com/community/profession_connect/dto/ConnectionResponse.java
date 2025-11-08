package com.community.profession_connect.dto;

import com.community.profession_connect.model.Connection;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionResponse {
    private Long id;
    private UserInfo requester;
    private UserInfo receiver;
    private String status;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String profession;
    }

    public static ConnectionResponse fromConnection(Connection connection) {
        ConnectionResponse response = new ConnectionResponse();
        response.setId(connection.getId());
        
        UserInfo requesterInfo = new UserInfo();
        requesterInfo.setId(connection.getRequester().getId());
        requesterInfo.setName(connection.getRequester().getName());
        requesterInfo.setEmail(connection.getRequester().getEmail());
        requesterInfo.setProfession(connection.getRequester().getProfession());
        response.setRequester(requesterInfo);
        
        UserInfo receiverInfo = new UserInfo();
        receiverInfo.setId(connection.getReceiver().getId());
        receiverInfo.setName(connection.getReceiver().getName());
        receiverInfo.setEmail(connection.getReceiver().getEmail());
        receiverInfo.setProfession(connection.getReceiver().getProfession());
        response.setReceiver(receiverInfo);
        
        response.setStatus(connection.getStatus().name());
        
        return response;
    }
}
