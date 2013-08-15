/** 
 * @author Thomas Verbeke
 * This class will start a new thread containing the serial reader.
 * Serial reader reads and decodes incoming MK frames. It puts the frames in a queue which is saved inside the servlet
 * context attribute.The servlet context attribute is notified (trough it's listener) when new data is available.
 * 
 * **/

package communication;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.util.concurrent.*;

public class InitCom implements ServletContextListener {
	private ExecutorService executor;
	
	public void contextDestroyed(ServletContextEvent event) {
		executor.shutdown();
		
	}

	public void contextInitialized(final ServletContextEvent event) {	
		// start task
		String serialPort = "/dev/cu.usbserial-A400782N"; //TODO Change to config file parameter
		boolean testMode = true;
		
		try {
			Thread thread = new Thread(new QueueReader(event, serialPort,testMode));
			thread.start();
		} catch (Exception e1) {
			System.out.println("Problem in SerialComInit");
			e1.printStackTrace();
		}
    }
}



