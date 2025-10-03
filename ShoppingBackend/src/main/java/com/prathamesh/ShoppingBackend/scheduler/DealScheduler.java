package com.prathamesh.ShoppingBackend.scheduler;

import com.prathamesh.ShoppingBackend.model.Deals;
import com.prathamesh.ShoppingBackend.repository.DealsRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class DealScheduler {

    private static final Logger log = LoggerFactory.getLogger(DealScheduler.class);

    private final DealsRepo dealsRepo;

    public DealScheduler(DealsRepo dealsRepo) {
        this.dealsRepo = dealsRepo;
    }

    @Scheduled(cron = "0 */5 * * * *") // Run every 5 minutes
    @Transactional
    public void deactivateExpiredDeals() {
        log.info("Running scheduled task to deactivate expired deals");
        
        LocalDate now = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        
        List<Deals> activeDeals = dealsRepo.findAll().stream()
                .filter(Deals::isActive)
                .toList();
        
        int deactivatedCount = 0;
        for (Deals deal : activeDeals) {
            LocalDate endDate = deal.getEndDate();
            LocalTime endTime = deal.getEndTime();
            
            if (endDate.isBefore(now) || (endDate.isEqual(now) && endTime.isBefore(currentTime))) {
                deal.setActive(false);
                dealsRepo.save(deal);
                deactivatedCount++;
                log.info("Deactivated expired deal: {} (ID: {})", deal.getTitle(), deal.getId());
            }
        }
        
        if (deactivatedCount > 0) {
            log.info("Deactivated {} expired deal(s)", deactivatedCount);
        }
    }
}
