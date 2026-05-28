package draftkings.eureka.client.review.exception;

public class BadRequestException extends IllegalArgumentException {

    private static final long serialVersionUID = 1L;

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}