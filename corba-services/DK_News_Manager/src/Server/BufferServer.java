package Server;

import org.omg.CORBA.ORB;
import org.omg.CosNaming.NameComponent;
import org.omg.CosNaming.NamingContext;
import org.omg.CosNaming.NamingContextHelper;
/**
* La capa servidor que controla al componente Buffer
*/
public class BufferServer {
    public static void main(String args[]) {
       try {
    	   
            ORB orb = ORB.init(args, null); // Crea e inicializa el ORB
            // Crea un hilo (servant) y lo registra en el ORB
            BufferImpl bufferRef = new BufferImpl();
            bufferRef.setORB(orb);
            orb.connect(bufferRef);
            // Obtiene una referencia del objeto
            org.omg.CORBA.Object objRef = orb.resolve_initial_references("NameService");
            NamingContext ncRef = NamingContextHelper.narrow(objRef);
            // Activa la referencia
            NameComponent nc = new NameComponent("Buffer", "");
            NameComponent path[] = {nc};
            ncRef.rebind(path, bufferRef);
            System.out.println("Servidor Buffer preparado y esperando ...");
           // Espera indefinidamente atendiendo las peticiones de los clientes
           java.lang.Object sync = new java.lang.Object();
           synchronized(sync){
                 sync.wait();
           }
       } catch(Exception e) {
                   System.err.println("ERROR: " + e);
                   e.printStackTrace(System.out);
        }
    }
}
