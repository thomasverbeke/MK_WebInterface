package communication;

import java.io.OutputStream;
import java.util.ArrayList;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import javax.servlet.ServletContextEvent;

//TODO Add description for JAVADOC
public class QueueReader extends SerialReader {
	BlockingQueue<ArrayList> writeQueue = new LinkedBlockingQueue<ArrayList>();
	BlockingQueue<ArrayList> readQueue = new LinkedBlockingQueue<ArrayList>();
	
	public QueueReader(ServletContextEvent event, String port){
		super();
		OutputStream outStream;

		ArrayList init = new ArrayList(); 
    	init.add("init");
		readQueue.add(init);
		
		event.getServletContext().setAttribute("readQueue", readQueue);	//add readQueue to the context	
		writeQueue = (BlockingQueue<ArrayList>) event.getServletContext().getAttribute("writeQueue");
		
		try {
			outStream = Listen(port);
			//start QueueWriter in a new Thread
			Thread QueueWriter_t = new Thread(new QueueWriter(outStream, event));
			QueueWriter_t.start();
			
		} catch (Exception e) {
			System.out.println("Exception while trying to listen");
			e.printStackTrace();
		}
	}
	
}
