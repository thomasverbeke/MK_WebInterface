/** 
 * @author Thomas Verbeke
 * Broadcast data to all clients.
 * Handle incoming request.
 * **/

/*

 * Copyright 2013 Jeanfrancois Arcand
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package org.atmosphere.coptermotion;

import static org.atmosphere.cpr.ApplicationConfig.PROPERTY_USE_STREAM;

import org.atmosphere.config.service.AtmosphereHandlerService;
import org.atmosphere.cpr.AtmosphereResource;
import org.atmosphere.cpr.AtmosphereResourceEvent;
import org.atmosphere.cpr.AtmosphereResponse;
import org.atmosphere.cpr.Broadcaster;
import org.atmosphere.cpr.MetaBroadcaster;
import org.atmosphere.handler.AbstractReflectorAtmosphereHandler;
import org.atmosphere.interceptor.AtmosphereResourceLifecycleInterceptor;
import org.atmosphere.interceptor.BroadcastOnPostAtmosphereInterceptor;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import javax.servlet.ServletContextAttributeEvent;
import javax.servlet.ServletContextAttributeListener;


/**
 * Simple AtmosphereHandler that implement the logic to build a Chat application.
 *
 * @author Jeanfrancois Arcand
 */


@AtmosphereHandlerService(path="/chat",
        interceptors = {AtmosphereResourceLifecycleInterceptor.class,
                        BroadcastOnPostAtmosphereInterceptor.class})
public class ChatAtmosphereHandler extends AbstractReflectorAtmosphereHandler implements ServletContextAttributeListener {
	BlockingQueue<ArrayList> readQueue = new LinkedBlockingQueue<ArrayList>();
	private static BlockingQueue<ArrayList> writeQueue = new LinkedBlockingQueue<ArrayList>(); //had to make it static because onStateChange was making it's own version of queue.

	Broadcaster broadcaster;
	private static final Logger logger = LoggerFactory.getLogger(AbstractReflectorAtmosphereHandler.class);
	private boolean queueInit = false;
	private boolean queueWriteInit = false;
	
	
	//is going to be called when both writeQueue and queue have been initialized & added to context
	public void attributeAdded(ServletContextAttributeEvent event) {

		readQueue = (BlockingQueue<ArrayList>) event.getServletContext().getAttribute("readQueue");
		
		//take first element of writeQueue
		
			if (readQueue == null || queueInit == true){
				//System.out.println("queue is null");
			} else {
				queueInit = true;
				
				Thread thread = new Thread(new Runnable(){
					public void run(){
						ArrayList item;
						try {
							//while (!(item = queue.take()).equals(SHUTDOWN_REQ)) {
							while (true) {
								item = readQueue.take();						    
							    JSONObject obj=new JSONObject();
							    //String s = JSONValue.toJSONString(item);
							    obj.put("type", item.get(0));
							    obj.put("data", item);	
							    obj.put("source", "server");
							    MetaBroadcaster.getDefault().broadcastTo("/chat", obj.toJSONString());
							}
						} catch (InterruptedException e) {
							e.printStackTrace();
						}
					}
				});			
				thread.start();
				
				ArrayList frame = new ArrayList(); 
				frame.add("init");
				writeQueue.add(frame);
				writeQueue.add(frame);
				event.getServletContext().setAttribute("writeQueue", writeQueue);
			}
							
			if (queueWriteInit == true || queueInit==false ){
				//System.out.println("writeQueue is null");
			} else {
				queueWriteInit = true;
				//old code now moved to serialWriter.java
	        	//Thread thread = new Thread(new Runnable(){
				//	public void run(){
				//		ArrayList item;
				//		try {
				//			while (true) {
				//				item = writeQueue.take();			
				//				System.out.println("Spilling the guts");
				//			    System.out.println(item.toString());
				//			}
				//		} catch (InterruptedException e) {
				//			e.printStackTrace();
				//		}
				//	}
				//});			
				//thread.start();	
			}				
	}
	public void attributeRemoved(ServletContextAttributeEvent event) {
		System.out.println("attribute removed");
	}

	public void attributeReplaced(ServletContextAttributeEvent event) {
		System.out.println("attribute replaced");
	}

	public void onRequest(AtmosphereResource resource) throws IOException {	
		//Object message = resource.getAtmosphereResourceEvent().getMessage(); //is empty why?
		//leave connection open
		resource.suspend();
		
		BufferedReader reader = resource.getRequest().getReader();
		Object message = reader.readLine();
        
		if (message !=null){
			Object obj = JSONValue.parse(message.toString());
	        JSONObject jsonObject = (JSONObject) obj;
	        Object source = jsonObject.get("source");
	        
			System.out.println("**onRequest: "+message.toString());
			ArrayList frame = new ArrayList(); 
        	frame.add(jsonObject.get("type"));
        	frame.add(jsonObject.get("data"));
        	writeQueue.add(frame);
		}
	}

	public void destroy() {
		System.out.println("destroy");	
	}
	
	public void onStateChange(AtmosphereResourceEvent event)
            throws IOException {
		
		/** This method gets invoked when: 
				(1) The remote connection gets closed, either by a browser or a proxy
				(2) The remote connection reach its maximum idle time (AtmosphereResource.suspend))
				(3) Everytime a broadcast operation is executed (broadcaster.broadcast)
		**/
		
        Object message = event.getMessage();
   
        AtmosphereResponse r = event.getResource().getResponse();
        if (message == null || event.isCancelled() || event.getResource().getRequest().destroyed()) return; 
    	//message from server: broadcast
 	
        Object obj = JSONValue.parse(message.toString());
        JSONObject jsonObject = (JSONObject) obj;
        Object source = jsonObject.get("source");
        
        if (event.getResource().getSerializer() != null) {
            try {
                event.getResource().getSerializer().write(event.getResource().getResponse().getOutputStream(), message);
            } catch (Throwable ex) {
                logger.warn("Serializer exception: message: " + message, ex);
                throw new IOException(ex);
            }
        } else {
            boolean isUsingStream = true;
            if (source.equals("client")){
            	//do nothing
            	System.out.println("source is client");
            } else {
            	 if (event.getResource().getRequest().getAttribute(PROPERTY_USE_STREAM) != null) {
                     isUsingStream = (Boolean) event.getResource().getRequest().getAttribute(PROPERTY_USE_STREAM);
                 }

                 if (!isUsingStream) {
                     try {
                         r.getWriter();
                     } catch (IllegalStateException e) {
                         isUsingStream = true;
                     }
                 }

                 if (message instanceof List) {
                     for (String s : (List<String>) message) {
                         if (isUsingStream) {
                            r.getOutputStream().write(s.getBytes(r.getCharacterEncoding()));
                            r.getOutputStream().flush();
                         } else {
                            r.getWriter().write(s);
                            r.getWriter().flush();
                         }
                     }
                 } else {
                     if (isUsingStream) {
                        r.getOutputStream().write(message.toString().getBytes(r.getCharacterEncoding()));
                        r.getOutputStream().flush();
                     } else {
                        r.getWriter().write(message.toString());
                        r.getWriter().flush();
                     }
                 }
            }
           
        }
        postStateChange(event);
    }	
}
