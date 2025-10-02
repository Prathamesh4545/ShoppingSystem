package com.prathamesh.ShoppingBackend.repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prathamesh.ShoppingBackend.model.User;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    User findByUserName(String username);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :date")
    long countUsersRegisteredAfter(@Param("date") Date date);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(@Param("start") Date start, @Param("end") Date end);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt < :date")
    long countByCreatedAtBefore(@Param("date") Date date);
    
    @Query("SELECT NEW map(u.role as role, COUNT(u) as userCount) " +
           "FROM User u " +
           "GROUP BY u.role")
    List<Map<String, Object>> getUserCountByRole();
    
    @Query("SELECT NEW map(FUNCTION('DATE', u.createdAt) as date, COUNT(u) as userCount) " +
           "FROM User u " +
           "WHERE u.createdAt >= :startDate " +
           "GROUP BY FUNCTION('DATE', u.createdAt) " +
           "ORDER BY date")
    List<Map<String, Object>> getDailyUserRegistrations(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT NEW map(FUNCTION('MONTH', u.createdAt) as month, COUNT(u) as userCount) " +
           "FROM User u " +
           "WHERE u.createdAt >= :startDate " +
           "GROUP BY FUNCTION('MONTH', u.createdAt) " +
           "ORDER BY month")
    List<Map<String, Object>> getMonthlyUserRegistrations(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT NEW map(FUNCTION('YEAR', u.createdAt) as year, COUNT(u) as userCount) " +
           "FROM User u " +
           "WHERE u.createdAt >= :startDate " +
           "GROUP BY FUNCTION('YEAR', u.createdAt) " +
           "ORDER BY year")
    List<Map<String, Object>> getYearlyUserRegistrations(@Param("startDate") LocalDateTime startDate);

}
