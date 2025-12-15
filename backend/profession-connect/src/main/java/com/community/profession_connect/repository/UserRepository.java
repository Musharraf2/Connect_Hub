package com.community.profession_connect.repository;

import com.community.profession_connect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByProfession(String profession);
    Optional<User> findByPhoneNumber(String phoneNumber);
}

