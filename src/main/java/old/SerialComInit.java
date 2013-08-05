/** 
 * @author Thomas Verbeke
 * This class will start a new thread containing the serial reader.
 * Serial reader reads and decodes incoming MK frames. It puts the frames in a queue which is saved inside the servlet
 * context attribute.The servlet context attribute is notified (trough it's listener) when new data is available.
 * 
 * **/

package old;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.util.concurrent.*;

public class SerialComInit implements ServletContextListener {
	private ExecutorService executor;
	public int test;

	public void contextDestroyed(ServletContextEvent event) {
		executor.shutdown();
		
	}

	public void contextInitialized(final ServletContextEvent event) {	
		// start task
		String serialPort = "/dev/cu.usbserial-A400782N"; //TODO Change to config file parameter
		/** mode 1 is test mode; mode 0 is for production**/
		int mode = 0; 
		if(mode==1){
			System.out.println("Engaging Testmode");
		}
		try {
			Thread thread = new Thread(new SerialReader(event, serialPort,mode));
			thread.start();
		} catch (Exception e1) {
			System.out.println("Problem in SerialComInit");
			e1.printStackTrace();
		}
    }
}



