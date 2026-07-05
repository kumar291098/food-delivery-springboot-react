package com.foodapp.notificationservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "order-exchange";
    public static final String QUEUE = "order-notification-queue";
    public static final String ROUTING_KEY = "order.status.update";

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue orderNotificationQueue() {
        return new Queue(QUEUE, true);
    }

    @Bean
    public Binding binding(Queue orderNotificationQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(orderNotificationQueue).to(orderExchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
