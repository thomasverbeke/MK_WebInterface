package communication;

import java.io.OutputStream;
import java.util.ArrayList;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import javax.servlet.ServletContextEvent;
import org.atmosphere.cpr.MetaBroadcaster;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;


//TODO Add description for JAVADOC
//TODO Add all other commands
//TODO Test
public class QueueWriter extends SerialWriter implements Runnable {
	BlockingQueue<ArrayList> writeQueue = new LinkedBlockingQueue<ArrayList>();
	public QueueWriter(OutputStream writer, ServletContextEvent event) {
		super(writer);
		writeQueue = (BlockingQueue<ArrayList>) event.getServletContext().getAttribute("writeQueue");
		
		//start OSD data req
		_OSDDataInterval(50);
		//test the timer
		//startSubscriptionService();
	}
	
	@Override
	public void run() {
		ArrayList item;
		while(true){
			try {	
				item = writeQueue.take();	
				Number Longitude, Latitude,Altitude,Status,Heading,ToleranceRadius,HoldTime,Event_Flag,Index,Type,WP_EventChannelValue;
		    	Number AltitudeRate,Speed,CamAngle;
		    	
				//ignore init
				if (!item.get(0).equals("init")){
				    String type = item.get(0).toString();
				    String data = item.get(1).toString();
					
				    switch (type) {
				    	case "sendWPlist":
				    		System.out.println("<QueueWriter>sendWPlist");
					    	break;
					    case "sendWP":
					    	System.out.println("<QueueWriter>sendWP");
					    	Object obj = JSONValue.parse(data);
					    	JSONObject jsonObject = (JSONObject) obj;
					    	Object position = jsonObject.get("Position");
					    	
					    		
					    	//http://code.google.com/p/json-simple/wiki/MappingBetweenJSONAndJavaEntities
					    	JSONObject posObj = (JSONObject) position;
					    
					    	Longitude = (Number) posObj.get("Longitude");
					    	Latitude = (Number) posObj.get("Latitude");
					    	Altitude = (Number) posObj.get("Altitude");
					    	Status = (Number) posObj.get("Status");
			
					    	Heading = (Number) jsonObject.get("Heading");
					    	ToleranceRadius = (Number) jsonObject.get("ToleranceRadius");
					    	HoldTime = (Number) jsonObject.get("HoldTime");
					    	Event_Flag = (Number) jsonObject.get("Event_Flag");
					    	
					    	Index = (Number) jsonObject.get("Index");
					    	Type = (Number) jsonObject.get("Type");
					    	
					    	WP_EventChannelValue = (Number) jsonObject.get("WP_EventChannelValue");
					    	AltitudeRate = (Number) jsonObject.get("AltitudeRate");
					    	
					    	Speed = (Number) jsonObject.get("Speed");
					    	CamAngle = (Number) jsonObject.get("CameraAngle");

					    	//call serialWriter method
					    	_sendWP(Longitude.intValue(), Latitude.intValue(), Altitude.intValue(), Heading.intValue(), ToleranceRadius.intValue(), HoldTime.intValue(), Event_Flag.intValue(), Index.intValue(), Type.intValue(), WP_EventChannelValue.intValue(), AltitudeRate.intValue(), Speed.intValue(), CamAngle.intValue());
					   

					    	break;
					    case "reqWP":
					    	System.out.println("<QueueWriter>reqWP");
					    	_reqWP(Integer.valueOf(data).intValue());
					    	
					    	break;
					    case "serialTest":
					    	System.out.println("<QueueWriter>serialTest");
					    	break;
					    case "3DDataInterval":
					    	System.out.println("<QueueWriter>3DDataInterval");
					    	break;
					    case "OSDDataInterval":
					    	System.out.println("<QueueWriter>OSDDataInterval");
					    	break;
					    case "EngineTest":
					    	System.out.println("<QueueWriter>EngineTest");
					    	break;
					    case "DebugReqInterval":
					    	System.out.println("<QueueWriter>DebugReqInterval");
					    	break;
				    }
				}
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		    
		    
		}
	}

	
}
