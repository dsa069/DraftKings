package Server;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.omg.CORBA.StringHolder;

/** Tests muy simples para BufferImpl */
class BufferImplTest {

    private BufferImpl buffer;

    @BeforeEach
    void setup() {
        buffer = new BufferImpl();
    }

    @Test
    void putGetReadAndCount() {
        assertEquals(0, buffer.num_elementos());

        // entradas inválidas
        assertFalse(buffer.put(null));
        assertFalse(buffer.put(""));

        // insertar y leer
        assertTrue(buffer.put("noticia1"));
        assertEquals(1, buffer.num_elementos());

        StringHolder sh = new StringHolder();
        assertTrue(buffer.read(sh));
        assertEquals("noticia1", sh.value);

        assertTrue(buffer.get(sh));
        assertEquals("noticia1", sh.value);
        assertEquals(0, buffer.num_elementos());
    }

    @Test
    void limiteFijoDe30() {
        for (int i = 0; i < 30; i++) {
            assertTrue(buffer.put("noticia" + i));
        }
        assertEquals(30, buffer.num_elementos());
        assertFalse(buffer.put("noticia30"));
        assertEquals(30, buffer.num_elementos());
        assertFalse(buffer.fijarLimiteNoticias(2));
        assertEquals(30, buffer.num_elementos());
    }
}
