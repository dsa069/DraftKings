package Server;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Method;

import org.junit.jupiter.api.Test;

/** Test muy simple para BufferServer: verifica que exista main(String[]). */
class BufferServerTest {

    @Test
    void mainMethodExists() throws Exception {
        Method m = BufferServer.class.getMethod("main", String[].class);
        assertNotNull(m);
    }
}
