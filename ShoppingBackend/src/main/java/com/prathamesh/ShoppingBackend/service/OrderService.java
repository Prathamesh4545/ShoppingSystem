package com.prathamesh.ShoppingBackend.service;

import java.util.List;
import org.springframework.stereotype.Service;

import com.prathamesh.ShoppingBackend.Exception.OrderNotFoundException;
import com.prathamesh.ShoppingBackend.model.Orders;
import com.prathamesh.ShoppingBackend.repository.OrderRepo;

@Service
public class OrderService {

    private OrderRepo orderRepo;

    public OrderService(OrderRepo orderRepo){
        this.orderRepo = orderRepo;
    }

    public List<Orders> getAllOrders() {
        return orderRepo.findAll();
    }

    public Orders getOrderById(long id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: "+id));
    }

    public Orders addOrder(Orders orders) {
        return orderRepo.save(orders);
    }

    public Orders updateOrder(long id, Orders orders) {
        Orders existingOrder = getOrderById(id);

        existingOrder.setStatus(orders.getStatus());
        existingOrder.setTotalAmount(orders.getTotalAmount());
        
        return orderRepo.save(existingOrder);
    }

    public Orders deleteOrder(long id) {
        Orders order = getOrderById(id);
        orderRepo.delete(order);
        return order;
    }

}
