//TODO reconnect feature & button

var subSocket; //we want to acces it outside of jquery
$(function () {
    "use strict";

    var header = $('#header');
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    
    var socket = $.atmosphere;
    //var subSocket;
    var transport = 'websocket';

    // Attributes
    //document.location.toString()
    //https://github.com/Atmosphere/atmosphere/wiki/jQuery.atmosphere.js-API
    //request.url = document.location.toString() + 'chat';
    var request = { url: 'ws://localhost:8080/chat_test/' + 'chat', //url to connect with
        contentType : "application/json",
        logLevel : 'debug', //allowed are info, debug and error
        transport : transport ,
        enableProtocol : true,
        fallbackTransport: 'long-polling'};


    request.onOpen = function(response) {
    	//invoked when the connection gets opened.	
    	if (response.transport == "websocket"){
    		document.getElementById("serverLink").innerHTML = "<p>Connected using websockets</p>";  
    	} else {
    		document.getElementById("serverLink").innerHTML = "<p>Connected using " + response.transport + "</p>";  
    	}
    	

    	
        transport = response.transport;

        if (response.transport == "local") {
            //subSocket.pushLocal("Name?");
        	console.log("**local**");
        }
    };

    
    request.onTransportFailure = function(errorMsg, request) {
    	//Invoked when the request.transport fails because it is not supported by the client or the server. 
    	//You can reconfigure a new transport (request.transport) from that function.
    	//Invoking SSE
        jQuery.atmosphere.info(errorMsg);
        if (window.EventSource) {
            request.fallbackTransport = "sse";
            transport = "see";
        }
        //header.html($('<h3>', { text: 'Atmosphere Framework. Default transport is WebSocket, fallback is ' + request.fallbackTransport }));
        //document.getElementById("atmosphereStatus").innerHTML = "Connected using " + response.transport;
        console.log("request onclose - errorMsg: "+errorMsg + "request: " + request);
        
    };

    request.onClose = function(response) {
    	//invoked when the connection gets closed
    	document.getElementById("serverLink").innerHTML = '<p style="color: red;">Disconnected from server</p>';   
    	console.log("request onclose"+response);
    };

    request.onError = function(response) {
    	//invoked when an unexpected error occurs 	
    	document.getElementById("serverLink").innerHTML = '<p style="color: red;">Disconnected from server.Problem with server.</p>';  
		console.log("request onerror"+response);
    };
    
    request.onMessage = function (response) {
    	//TODO multithread onMessage using webworkers
        //callback when a new frame has arrived
        var message = response.responseBody;
        try {
            var json = jQuery.parseJSON(message);
            //console.log("Frame : "+json.type + " " +json.value); 
            switch(json.type){
            case "OSD":
    			//build up OSD
				var currentPosition = ({
					"Latitude" : json.data[1],
					"Longitude" : json.data[2],
					"Altitude" : json.data[3],
					"Status" : json.data[4]			
				});
				
				var targetPosition = ({
					"Latitude" : json.data[5],
					"Longitude" : json.data[6],
					"Altitude" : json.data[7],
					"Status" : json.data[8]			
				});
				
				var homePosition = ({
					"Latitude" : json.data[9],
					"Longitude" : json.data[10],
					"Altitude" : json.data[11],
					"Status" : json.data[12]			
				});

				
				var OSD = ({
					"currentPosition" : currentPosition,
					"targetPosition":targetPosition,
					"homePosition" : homePosition,
					"waypointIndex": json.data[13],
					"waypointNumber" : json.data[14],
					"satsInUse" : json.data[15],
					"altimeter" : json.data[16],
					"variometer" : json.data[17],
					"flyingTime" : json.data[18],
					"uBat" : json.data[19],
					"groundSpeed" : json.data[20],
					"heading" : json.data[21],
					"compassHeading" : json.data[22],
					"angleNick" : json.data[23],
					"angleRoll" : json.data[24],
					"rcQuality" : json.data[25],
					"FCFlags" : json.data[26],
					"NCFlags" : json.data[27],
					"Errorcode" : json.data[28],
					"OperatingRadius" : json.data[29],
					"TopSpeed" : json.data[30],
					"TargetHoldTime" : json.data[31],
					"FCStatusFlags2" : json.data[32],
					"SetpointAltitude" : json.data[33],
					"Gas" : json.data[34],
					"Current" : json.data[35],
					"UsedCapacity" : json.data[36],
					"version" : json.data[37]
				});
				
            	document.getElementById("OSD0").innerHTML = "CurrentPosition: "+ OSD.currentPosition.Latitude+" /  "+ OSD.currentPosition.Longitude+" / "+ OSD.currentPosition.Altitude+"";
            	document.getElementById("OSD1").innerHTML = "TargetPosition: "+ OSD.currentPosition.Latitude+" /  "+ OSD.currentPosition.Longitude+" / "+ OSD.currentPosition.Altitude+"";
            	document.getElementById("OSD2").innerHTML = "HomePosition: "+ OSD.currentPosition.Latitude+" /  "+ OSD.currentPosition.Longitude+" / "+ OSD.currentPosition.Altitude+"";
            	document.getElementById("OSD3").innerHTML = "CurrentWP/TotalWP: "+OSD.waypointIndex+ "/" + OSD.waypointNumber;
            	document.getElementById("OSD4").innerHTML = "StatsInUse: " + OSD.satsInUse;
            	document.getElementById("OSD5").innerHTML = "Altimeter (air pressure): " + OSD.altimeter;
            	document.getElementById("OSD6").innerHTML = "Variometer (climb/sink rate): " + OSD.variometer;
            	document.getElementById("OSD7").innerHTML = "FlyingTime" + OSD.flyingTime + "s";
            	document.getElementById("OSD8").innerHTML = "Battery Voltage: " + OSD.uBat + "V";
            	document.getElementById("OSD9").innerHTML = "GroundSpeed: " + OSD.groundSpeed + "cm/s";
            	document.getElementById("OSD10").innerHTML = "Heading (angle to north): " + OSD.heading;
            	document.getElementById("OSD11").innerHTML = "CompassHeading: " + OSD.compassHeading;
            	document.getElementById("OSD12").innerHTML = "AngleNick: " + OSD.angleNick;
            	document.getElementById("OSD13").innerHTML = "AngleRoll: " + OSD.angleRoll;
            	document.getElementById("OSD14").innerHTML = "RCQuality: " + OSD.rcQuality;
            	document.getElementById("OSD15").innerHTML = "OperatingRadius: " + OSD.OperatingRadius;
            	document.getElementById("OSD16").innerHTML = "TopSpeed: " + OSD.TopSpeed;
            	document.getElementById("OSD17").innerHTML = "TargetHoldTime: " + OSD.TargetHoldTime;
            	document.getElementById("OSD18").innerHTML = "SetPointAltitude: " + OSD.SetpointAltitude;
            	document.getElementById("OSD19").innerHTML = "Current: " + OSD.Current;
            	document.getElementById("OSD18").innerHTML = "Gas: " + OSD.Gas;
            	document.getElementById("OSD21").innerHTML = "UsedCapacity: " + OSD.UsedCapacity;
            	document.getElementById("OSD22").innerHTML = "Version: " + OSD.version;
            	
            	//update the currentPosition on the map
				currentPos = new google.maps.Marker({
					position: new google.maps.LatLng(OSD.currentPosition.Latitude,OSD.currentPosition.Longitude),
					map: map,
					title:"Current Position!"
				});
				
				//update the targetPosition on the map
				targetPos = new google.maps.Marker({
					position: new google.maps.LatLng(OSD.targetPosition.Latitude,OSD.targetPosition.Longitude),
					map: map,
					title:"Target Position!"
				});
				
				//update the HomePos on the map
				homePos = new google.maps.Marker({
					position: new google.maps.LatLng(OSD.homePosition.Latitude,OSD.homePosition.Longitude),
					map: map,
					title:"Home Position!"
				});

            	console.log("Frame:",json.type,OSD); 
            break;
            
            case "serialTest":
            	var serialTest = ({
            		"value" :json.data[1] 
            	});
            	console.log("Frame:",json.type,serialTest); 
            	document.getElementById("SerialTest").innerHTML = "SerialTest: <input type=\"text\" name=\"SerialNumber\"><button onclick=\"sendcommand('serialTest');\">Send Frame</button><div id=\"green\">OK</div>";
            	break;
            	
            case "Data3D":
                
            	var data3D = ({
            		"AngleNick" :json.data[1]*0.1 ,
            		"AngleRoll" :json.data[2]*0.1 ,
            		"Heading" :json.data[3]*0.1 ,
            		"CentroidNick" :json.data[4],
            		"CentroidRoll" :json.data[5] ,
            		"CentroidYaw" :json.data[6] 
            	});
            	
            	console.log("Frame :",json.type,data3D); 
            	
            	if (data3D.Heading>180){
            		data3D.Heading = data3D.Heading%180;
            	} 
            	
            	if (data3D.AngleNick){
            		data3D.AngleNick = data3D.AngleNick%180;
            	}
            	
            	if (data3D.AngleRoll){
            		data3D.AngleRoll = data3D.AngleRoll%180;
            	}
            	
            	document.getElementById("AngleNick").innerHTML = "AngleNick: "+data3D.AngleNick;
            	document.getElementById("AngleRoll").innerHTML = "AngleRoll: "+data3D.AngleRoll;
            	document.getElementById("Heading").innerHTML = "Heading: "+data3D.Heading;
            	document.getElementById("CentroidNick").innerHTML = "CentroidNick: "+data3D.CentroidNick;
            	document.getElementById("CentroidRoll").innerHTML = "CentroidRoll: "+data3D.CentroidRoll;
            	document.getElementById("CentroidYaw").innerHTML = "CentroidYaw: "+data3D.CentroidYaw;
            	break;
            	
            case "errorMsg":
            	var errorMsg = ({
            		"message" :json.data[1] 
            	});
            	console.log("Frame :",json.type,errorMsg);  
            	break;
            	
            case "sendWP_ACK":
            	var numberOfWP = ({
            		"numberOfWP" :json.data[1] 
            	});
            	
            	console.log("Frame :",json.type,numberOfWP);  
            	document.getElementById("SendWP").innerHTML = "Send WP:  <button onclick=\"sendcommand('sendWP');\">Send Frame</button><div id=\"green\">OK</div>";           	          	
            	break;
            	
            case "motorTest":
            	var motorTest = ({
            		"value" :"OK" //TODO include timestamp maybe?
            	});
            	console.log("Frame :",json.type,motorTest);  
            	document.getElementById("EngineTest").innerHTML = "Engine Test: <input type=\"text\" name=\"EngineSpeed\"><button onclick=\"sendcommand('EngineTest');\">Send Frame</button><div id=\"green\">OK</div>";
            	break;
            	
            case "MotorData":
            	var motorData = ({
            		"Index" :json.data[1], // address of BL-Ctrl 
            		"Current" :json.data[2],
            		"Temperature" :json.data[3],// only valid fpr BL-Ctrl >= V2.0
            		"MaxPWM" :json.data[4],
            		"Status" :json.data[5]
            	});
            	console.log("Frame :",json.type,MotorData);  
            	document.getElementById("Motor"+motorData.Index).innerHTML = "Motor : "+motorData.Index + " Current: "+motorData.Current
            	+ " Temperature: "+motorData.Temperature+" MaxPWM: "+motorData.MaxPWM+" Status: "+motorData.Status;
            	break;
            	
            case "getsetNCParam":
            	var getsetNCParam = ({
            		"parameterId" :json.data[1],
            		"parameterValue" :json.data[2]
            	});
            	console.log("Frame :",json.type,getsetNCParam);  
            	break;
            	
            	
            case "versionInfo":
            	var versionInfo = ({
            		"SWMajor" :json.data[1],
            		"SWMinor" :json.data[2],
            		"ProtoMajor" :json.data[3],
            		"ProtoMinor" :json.data[4],
            		"SWPatch" :json.data[5],
            		"HardwareError" :json.data[6]
            	});
            	console.log("Frame :",json.type,versionInfo);  
            	break;
            	
            case "analogLabel":
            	var analogLabel = ({
            		"Index" :json.data[1],
            		"Label" :json.data[2]
            	});
            	console.log("Frame :",json.type,analogLabel);  
            	break;
            	
            case "analogData":
            	//the values can change !! normally I should populate the names from another frame the analogLabel frame
            	var analogData = ({
            		"Status" :json.data[1],
            		"AngleNick" :json.data[2],
            		"AngleRoll" :json.data[3],
            		"AccNick" :json.data[4],
            		"AccRoll" :json.data[5],
            		"YawGyro" :json.data[6],
            		"Height data" :json.data[7],
            		"AccZ" :json.data[8],
            		"Gas" :json.data[9],
            		"Compass Value" :json.data[10],
            		"Voltage" :json.data[11],
            		"Reciever Level" :json.data[12],
            		"Gyro compass" :json.data[13],
            		"Motor1" :json.data[14],
            		"Motor2" :json.data[15],
            		"Motor3" :json.data[16],
            		"Motor4" :json.data[17],
            		"16" :json.data[18],
            		"17" :json.data[19],
            		"18" :json.data[20],
            		"19" :json.data[21],
            		"Servo" :json.data[22],
            		"HoverGas" :json.data[23],
            		"Current" :json.data[24],
            		"Capacity" :json.data[25],
            		"Height setpoint" :json.data[26],
            		"25" :json.data[27],
            		"26" :json.data[28],
            		"Compass Setpoint" :json.data[29],
            		"I2C-Error" :json.data[30],
            		"BL Limit" :json.data[31],
            		"GPS_Nick" :json.data[32],
            		"GPS_Roll" :json.data[33],
            	});
            	console.log("Frame :",json.type,analogData);  
            	break;
            	
            case "reqWP":
                
            	var position = ({
					"Latitude" : json.data[1],
					"Longitude" : json.data[2],
					"Altitude" : json.data[3],
					"Status" : json.data[4]			
				});
				
            	
            	var reqWP = ({
            		"Position" : position,
            		"Heading" :json.data[1] ,
            		"ToleranceRadius" :json.data[2] ,
            		"HoldTime" :json.data[3] ,
            		"Event_Flag" :json.data[4],
            		"Index" :json.data[5] ,
            		"Type" :json.data[6] ,
            		"WP_EventChanneldata" :json.data[7] ,
            		"AltitudeRate" :json.data[8] ,
            		"Speed" :json.data[9] ,
            		"CamAngle" :json.data[10] ,
            		"Name" :json.data[11]      		
            	});
            	
            	console.log("Frame :",json.type,reqWP); 
            	document.getElementById("ReqWP").innerHTML = "Request WP:  <input type=\"text\" name=\"WPIndex\"><button onclick=\"sendcommand('reqWP');\">Send Frame</button><div id=\"green\">OK</div>";           	
            	break;
            	
            default:
            	console.log("Unrecognised frame : " + json.type);
            	break;     
            }
               
            //TODO Next step is building a small test web-interface for demo
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
    };
    

    subSocket = socket.subscribe(request);

});


function sendcommand(command,input){
	 	//subSocket = $.socket.subscribe(request);
		var data;
    	switch (command){
    		//TODO Change data content
    		case "sendWP":
    			
    				//TODO Fill in
    			
    			var test = document.getElementById("WP_Set0").value;
    				var position = ({
    					"Latitude" :document.getElementById("WP_Set0").value,
    					"Longitude" : document.getElementById("WP_Set1").value,
    					"Altitude" : document.getElementById("WP_Set2").value,
    					"Status" : document.getElementById("WP_Set3").value			
    				});
    				
    				    
                	data = ({
                		"Position" : position,
                		"Heading" :document.getElementById("WP_Set4").value ,
                		"ToleranceRadius" :document.getElementById("WP_Set5").value,
                		"HoldTime" :document.getElementById("WP_Set6").value,
                		"Event_Flag" :document.getElementById("WP_Set7").value,
                		"Index" :document.getElementById("WP_Set8").value ,
                		"Type" :document.getElementById("WP_Set9").value ,              	
                		"WP_EventChanneldata" :document.getElementById("WP_Set10").value ,
                		"AltitudeRate" :document.getElementById("WP_Set11").value ,
                		"Speed" :document.getElementById("WP_Set12").value ,
                		"CamAngle" :document.getElementById("WP_Set13").value ,
                		"Name" :document.getElementById("WP_Set14").value    		
                	});
    			
    			console.log("<sending command> sendWP");
    			subSocket.push(jQuery.stringifyJSON({ type: "sendWP", data: data, source:"client" }));
    			document.getElementById("SendWP").innerHTML = "Send WP: <div id=\"red\">Waiting for ACK...</div>";
    			break;
    		case "sendWPlist":
    			//we need to send the complete array
    			subSocket.push(jQuery.stringifyJSON({ type: "sendWPlist", data: wpArray, source:"client" }));
    			break;
    		case "reqWP":
    			if (input.value == ""){
    				data="1"; //if empty send standard number; index
    			} else {
    				data = input.value;
    			} 
    			console.log("<sending command> reqWP");
    			subSocket.push(jQuery.stringifyJSON({ type: "reqWP", data: data, source:"client" }));
    			document.getElementById("ReqWP").innerHTML = "Request WP: <div id=\"red\">Waiting for ACK...</div>";
    			break;
    		case "serialTest":
    			if (input.value == ""){
    				data="10"; //if empty send standard number
    			} else {
    				data = input.value;
    			} 
    			console.log("<sending command> serialTest");
    			subSocket.push(jQuery.stringifyJSON({ type: "serialTest", data: 10, source:"client" }));
    			document.getElementById("SerialTest").innerHTML = "SerialTest: <div id=\"red\">Waiting for ACK...</div>";
    			break;
    		case "3DDataInterval":
    			if (input.value == ""){
    				data="1000"; //if empty send standard number; time in ms
    			} else {
    				data = input.value;
    			} 
    			console.log("<sending command> 3DDataInterval");
    			subSocket.push(jQuery.stringifyJSON({ type: "3DDataInterval", data: data , source:"client"}));
    			break;
    		case "OSDDataInterval":
    			if (input.value == ""){
    				data="100"; //time in ms in 10ms steps
    			} else {
    				data = input.value;
    			} 
    			console.log("<sending command> OSDDataInterval");
    			subSocket.push(jQuery.stringifyJSON({ type: "OSDDataInterval", data: data, source:"client" }));
    			break;
    		case "EngineTest":			
    			console.log("<sending command> EngineTest");
    			subSocket.push(jQuery.stringifyJSON({ type: "EngineTest", data: 10, source:"client" }));
    			document.getElementById("EngineTest").innerHTML = "SerialTest: <div id=\"red\">Waiting for ACK...</div>";
    			break;
    		case "DebugReqInterval":
    			console.log("<sending command> DebugReqInterval");
    			if (input.value == ""){
    				data="100"; //time in ms in 10ms steps expires after 4s
    			} else {
    				data = input.value;
    			}
    			subSocket.push(jQuery.stringifyJSON({ type: "DebugReqInterval", data: data, source:"client" }));
    			break;
    	}
    }
