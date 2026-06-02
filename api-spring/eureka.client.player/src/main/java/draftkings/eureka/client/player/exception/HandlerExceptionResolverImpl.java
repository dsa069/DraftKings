package draftkings.eureka.client.player.exception;

import java.io.IOException;
import java.time.OffsetDateTime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.stereotype.Component;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class HandlerExceptionResolverImpl implements HandlerExceptionResolver {

    private static final Logger logger = LoggerFactory.getLogger(HandlerExceptionResolverImpl.class);
    private final ObjectMapper mapper = createMapper();

    private static ObjectMapper createMapper() {
        ObjectMapper m = new ObjectMapper();
        m.findAndRegisterModules();
        m.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return m;
    }

    @Override
    public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response, Object handler,
            Exception ex) {
        logger.debug("HandlerExceptionResolverImpl invoked for request={} exception={}", request.getRequestURI(),
                ex.toString());
        if (ex instanceof ResponseStatusException) {
            ResponseStatusException rse = (ResponseStatusException) ex;
            return writeResponse(request, response, rse.getStatusCode().value(), resolveReason(rse.getReason(), rse));
        }
        if (ex instanceof BadRequestException || ex instanceof IllegalArgumentException) {
            return writeResponse(request, response, HttpStatus.BAD_REQUEST.value(), resolveReason(ex.getMessage(), ex));
        }
        if (ex instanceof ServiceUnavailableException || ex instanceof IllegalStateException) {
            return writeResponse(request, response, HttpStatus.SERVICE_UNAVAILABLE.value(),
                    resolveReason(ex.getMessage(), ex));
        }
        if (ex instanceof HttpMessageNotReadableException || ex instanceof MethodArgumentTypeMismatchException) {
            return writeResponse(request, response, HttpStatus.BAD_REQUEST.value(), resolveReason(ex.getMessage(), ex));
        }
        if (ex instanceof InternalServerErrorException || ex instanceof RuntimeException) {
            return writeResponse(request, response, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    resolveReason(ex.getMessage(), ex));
        }
        return null;
    }

    private ModelAndView writeResponse(HttpServletRequest request, HttpServletResponse response, int status,
            String errorMessage) {
        CustomResponse resp = new CustomResponse();
        resp.setTimestamp(OffsetDateTime.now());
        resp.setStatus(status);
        resp.setError(errorMessage);
        resp.setPath(request.getRequestURI());
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        try {
            mapper.writeValue(response.getWriter(), resp);
        } catch (IOException e) {
            logger.error("Failed to write error response", e);
        }
        return new ModelAndView();
    }

    private String resolveReason(String reason, Exception ex) {
        if (reason != null && !reason.isBlank()) {
            return reason;
        }
        return ex.getClass().getSimpleName();
    }
}
