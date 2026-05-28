package draftkings.eureka.client.review.exception;

import java.io.IOException;
import java.time.OffsetDateTime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
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
            CustomResponse resp = new CustomResponse();
            resp.setTimestamp(OffsetDateTime.now());
            resp.setStatus(rse.getStatusCode().value());
            String reason = rse.getReason();
            if (reason == null || reason.isBlank()) {
                reason = rse.getStatusCode().toString();
            }
            resp.setError(reason);
            resp.setPath(request.getRequestURI());
            response.setStatus(rse.getStatusCode().value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            try {
                mapper.writeValue(response.getWriter(), resp);
            } catch (IOException e) {
                logger.error("Failed to write error response", e);
            }
            return new ModelAndView();
        }
        return null;
    }
}
