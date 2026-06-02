package draftkings.eureka.client.user.dto;

import java.math.BigDecimal;
import java.util.Date;

public class ReviewDTO {
    private Long id;
    private Long userId;
    private String author;
    private String text;
    private Integer rating;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Date createdAt;

    public ReviewDTO() {
    }

    public ReviewDTO(Long id, Long userId, String author, String text, Integer rating,
            BigDecimal latitude, BigDecimal longitude, Date createdAt) {
        this.id = id;
        this.userId = userId;
        this.author = author;
        this.text = text;
        this.rating = rating;
        this.latitude = latitude;
        this.longitude = longitude;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
