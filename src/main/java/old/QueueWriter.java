package old;

import java.io.OutputStream;
import java.util.ArrayList;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import javax.servlet.ServletContextEvent;

import old_datatypes.Waypoint_t;
import old_datatypes.u16;
import old_datatypes.u8;

import org.atmosphere.cpr.MetaBroadcaster;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

public class QueueWriter implements Runnable {

	Encode encoder;
	BlockingQueue<ArrayList> writeQueue = new LinkedBlockingQueue<ArrayList>();
	boolean testmode = false;
	public QueueWriter (OutputStream writer,ServletContextEvent event){
		writeQueue = (BlockingQueue<ArrayList>) event.getServletContext().getAttribute("writeQueue");
		//writer could be null in testmode
		if(writer!=null){
			encoder = new Encode(writer);
		} else {
			testmode = true;
		}
		
	}
	public void run() {
		//blocking writer thread
		ArrayList item;
		while(true){
			try {	
				item = writeQueue.take();	
				
				//ignore init
				if (!item.get(0).equals("init")){
					//System.out.println("Spilling the guts");
				  
				    String type = item.get(0).toString();
				    String data = item.get(1).toString();
					
				    switch (type) {
				    	case "sendWPlist":
				    		
				    		//get list
				    		Object jsonObj = JSONValue.parse(data);
					    	JSONArray wplist = (JSONArray) jsonObj;
					    	//loop trough list
					    	JSONObject wp;
					    	Object Position, Longitude, Latitude,Altitude, Status,Heading,ToleranceRadius,HoldTime,Event_Flag,Index,Type,WP_EventChannelValue;
					    	Object AltitudeRate,Speed,CameraAngle;
					    	
					    	for (int wpID=0; wpID<wplist.size();wpID++){
					    		wp = (JSONObject) wplist.get(wpID);
					    		Position = wp.get("Position");
					    		
					    		JSONObject posObj = (JSONObject) Position;
					    		
					    		Longitude = posObj.get("Longitude");
						    	Latitude = posObj.get("Latitude");
						    	Altitude = posObj.get("Altitude");
						    	Status = posObj.get("Status");
					    		
					    		Heading = wp.get("Heading");
					    		ToleranceRadius = wp.get("ToleranceRadius");
					    		HoldTime = wp.get("HoldTime");
					    		Event_Flag = wp.get("Event_Flag");
					    		Index = wp.get("Index");
					    		Type = wp.get("Type");
					    		WP_EventChannelValue = wp.get("WP_EventChanneldata");
					    		AltitudeRate = wp.get("AltitudeRate");
					    		Speed = wp.get("Speed");
					    		CameraAngle = wp.get("CamAngle");  
					    		
					    		Waypoint_t newWP = new Waypoint_t("new WP");
					    	
					    		//long x = Math.round((double) Latitude * (new Double (10000000)));
					    		
					    		//TODO Check param!!
					    		long test = (long) Altitude *100;
					    		
					    		newWP.Position.Latitude.value = Math.round((double) Latitude * (new Double (10000000)));; //510481055 - 508796768
					    		newWP.Position.Longitude.value = Math.round((double) Longitude * (new Double (10000000))); //36827906
					    		newWP.Position.Altitude.value = 400;//5038 40m
					    		newWP.Position.Status.value = (long) Status; //1
					    		newWP.Heading.value = (long) Heading; //0
					    		newWP.ToleranceRadius.value = (long) ToleranceRadius; //10
					    		newWP.HoldTime.value = (long) HoldTime; //2
					    		newWP.Event_Flag.value = (long) Event_Flag; //1
					    		newWP.Index.value = (long) Index; //1
					    		newWP.Type.value = (long) Type; //0
					    		
					    		newWP.WP_EventChannelValue.value=(long) WP_EventChannelValue; //100
					    		newWP.AltitudeRate.value = (long) AltitudeRate; //30
					    		newWP.Speed.value = (long) Speed; //30
					    		newWP.CameraAngle.value = (long) CameraAngle; //0
					    		encoder.send_command(2,'w',newWP.getAsInt());
					    		
					    		//TODO maybe add wait function
					    		Thread.sleep(300);
					    	}
					    	
					    	
					    	
					    	
					    	break;
					    case "sendWP":
					    	Object obj = JSONValue.parse(data);
					    	JSONObject jsonObject = (JSONObject) obj;
					    	Object position = jsonObject.get("Position");
					    		
					    	
					    	JSONObject posObj = (JSONObject) position;
					    	Longitude = posObj.get("Longitude");
					    	Latitude = posObj.get("Latitude");
					    	Altitude = posObj.get("Altitude");
					    	Status = posObj.get("Status");
					    	
					    	Heading = jsonObject.get("Heading");
					    	ToleranceRadius = jsonObject.get("ToleranceRadius");
					    	HoldTime = jsonObject.get("HoldTime");
					    	Event_Flag = jsonObject.get("Event_Flag");
					    	
					    	Index = jsonObject.get("Index");
					    	Type = jsonObject.get("Type");
					    	
					    	WP_EventChannelValue = jsonObject.get("WP_EventChannelValue");
					    	AltitudeRate = jsonObject.get("AltitudeRate");
					    	
					    	Speed = jsonObject.get("Speed");
					    	CameraAngle = jsonObject.get("CameraAngle");
					    	
					    	//TODO Print all data first to check if all comes trough well!
					    	System.out.println();
					    	
					    	System.out.println("<SW>sendWP");
					    	if (testmode==false){
					    		/** (NAVI) SEND WAYPOINT **/
					    		
					    		Waypoint_t newWP = new Waypoint_t("new WP");
					    		newWP.Position.Longitude.value = 36827906;
					    		newWP.Position.Latitude.value = 510481055;
					    		newWP.Position.Altitude.value = 5038;
					    		newWP.Position.Status.value = 1;
					    		newWP.Heading.value = 0;
					    		newWP.ToleranceRadius.value = 10;
					    		newWP.HoldTime.value = 2;
					    		newWP.Event_Flag.value = 1;
					    		newWP.Index.value = 1;
					    		newWP.Type.value = 0;
					    		newWP.WP_EventChannelValue.value=100;
					    		newWP.AltitudeRate.value = 30;
					    		newWP.Speed.value = 30;
					    		newWP.CameraAngle.value = 0;
					    		encoder.send_command(2,'w',newWP.getAsInt());
					    	}

					    	break;
					    case "reqWP":
					    	System.out.println("<SW>reqWP");
					    	
					    	if (testmode==false){
					    		/** (NAVI)REQUEST WP **/
					    		u8 WP = new u8("New WP");
					    		//TODO TEST
					    		WP.value = Long.valueOf(data).longValue();				    		
					    		encoder.send_command(2,'x',WP.getAsInt());
					    	}
					    	break;
					    case "serialTest":
					    	System.out.println("<SW>serialTest");
					    	if (testmode==false){
					    		/** (NAVI) SERIAL LINK TEST **/
					    		
					    		u16 echo = new u16("echo");
					    		echo.value=Long.valueOf(data).longValue();
					    		encoder.send_command(2,'z',echo.getAsInt());
					    	}
					    	break;
					    case "3DDataInterval":
					    	System.out.println("<SW>3DDataInterval");
					    	if (testmode==false){
					    		/** (NAVI) SET 3D DATA INTERVAL**/
					    		u8 interval = new u8("interval");
					    		
					    		interval.value = Long.valueOf(data).longValue(); //PASSING 0 STOPS THE STREAM
					    		encoder.send_command(2,'c',interval.getAsInt());
					    	}
					    	break;
					    case "OSDDataInterval":
					    	System.out.println("<SW>OSDDataInterval");
					    	if (testmode==false){
					    		//TODO not tested
					    		/** (NAVI) SET 3D DATA INTERVAL**/
					    		u8 interval = new u8("interval");
					    		interval.value = Long.valueOf(data).longValue();
					    		encoder.send_command(2,'o',interval.getAsInt());
					    	}
					    	break;
					    case "EngineTest":
					    	System.out.println("<SW>EngineTest");
					    	
					    	if (testmode==false){
					    		//TODO Switch to flightctrl
					    		/** (FLIGHT) Engine Test **/
					    		int val = 0;
					    		
					    		if (Integer.parseInt(data) > 10 || Integer.parseInt(data) < 0 ){
					    			val = 10;
					    		} else {
					    			val = Integer.parseInt(data);
					    		}
					    		
					    		int motor[] = new int[16];
					    		motor[0] = val;
					    		motor[1] = val;
					    		motor[2] = val;
					    		motor[3] = val;
					    		motor[4] = val;
					    		motor[5] = val;
					    		encoder.send_command(1,'t',motor);
					    	}
					    	break;
					    case "DebugReqInterval":
					    	System.out.println("<SW>DebugReqInterval");
					    		if (testmode==false){
					    			//TODO Check if correct command or not
					    			/** Labels of Analog values request (for all 32 channels) **/
					    			encoder.send_command(0,'a',0);
					    		}
					    	break;
				    }
				}
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		    
		    
		}		
	}
	
	public void commands(){	
		//first redirect UART
	    
        //Thread.sleep(1000L);
        //encoder.send_magic_packet();
        //Thread.sleep(1000L);
             
        
    	//--WORKS--    
 

        /** (NAVI) ERROR TEXT REQUEST**/
        //encoder.send_command(2,'e');
        
        /** (COMMON) Version Request **/ //DATA OK?
        //encoder.send_command(0,'v');
        
        /** (COMMON) Request Display h **/
        //encoder.send_command(0,'h',1000);
        
        /** (COMMON) l REQUEST DIPLAY **/
        //u8 menuItem = new u8("menuItem");
        //menuItem.value = 1; //from 1 to 19!!
        //encoder.send_command(0,'l',menuItem.getAsInt());
        
        
        /** (NAVI) BL CTRL Status: BLDataStruct for every motor**/
        //u8 interval = new u8("interval");
        //interval.value = 3000; 
        //encoder.send_command(2,'k',interval.getAsInt());
	}
}
