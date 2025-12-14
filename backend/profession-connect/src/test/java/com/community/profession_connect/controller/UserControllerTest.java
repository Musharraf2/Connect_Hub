package com.community.profession_connect.controller;

import com.community.profession_connect.service.FileStorageService;
import com.community.profession_connect.service.OnlineUserService;
import com.community.profession_connect.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private OnlineUserService onlineUserService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetOnlineUsers_ReturnsSetOfUserIds() {
        // Arrange
        Set<Long> expectedOnlineUsers = Set.of(1L, 2L, 3L);
        when(onlineUserService.getOnlineUsers()).thenReturn(expectedOnlineUsers);

        // Act
        ResponseEntity<Set<Long>> response = userController.getOnlineUsers();

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(expectedOnlineUsers, response.getBody());
        verify(onlineUserService, times(1)).getOnlineUsers();
    }

    @Test
    void testGetOnlineUsers_ReturnsEmptySet_WhenNoUsersOnline() {
        // Arrange
        Set<Long> emptySet = Set.of();
        when(onlineUserService.getOnlineUsers()).thenReturn(emptySet);

        // Act
        ResponseEntity<Set<Long>> response = userController.getOnlineUsers();

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        verify(onlineUserService, times(1)).getOnlineUsers();
    }
}
