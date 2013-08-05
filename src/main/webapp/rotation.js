function generateWaypointsAtAngle(resultDegrees, shape){
	var angle = resultDegrees;
	console.log("angleinside: "+angle);
	drawPoly(shape,angle);
}

//change name
function drawPoly(polygonPaths,_angle) {
	// 1 DRAW POLYGON (IS NOT HAPPENING IN DRAWMANAGER
	var polygon = new Array();
	polygon = polygonPaths.getPath();
	
	//2 FIND THE PIVOTPOINT WHICH IS THE MIN LAT AND MIN LONG
	//Could make this first part into a function cause it's used more than 1once (in website and rotation (2x))
	var tempLatPolyArray = new Array();
	var tempLngPolyArray = new Array();
	var xsum=0,ysum=0,xcenter=0,ycenter=0;
	
	for (var i=0;i<polygon.getLength(); i++){
		//console.log("coord: "+polygonPaths.getAt(0).getAt(i).lat());
		tempLatPolyArray.push(polygon.getAt(i).lat());
		tempLngPolyArray.push(polygon.getAt(i).lng());
		xsum += polygon.getAt(i).lat();
		ysum += polygon.getAt(i).lng();
		
	}	
			
	//define the center of the shape as the point of rotation
	xcenter = xsum/polygon.getLength();
	ycenter = ysum/polygon.getLength();

	var pivotPoint = new google.maps.LatLng(xcenter,ycenter);

	//3 FIND THE ROTATION ANGLE (NOW A PROPERTY OF THIS FUNCTION)
	var angle = -_angle+90;
	//console.log("angle: "+angle);
	
	//4 ROTATE THE POLYGON TO -ANGLE
	//!!!have to change this to polygon being given as an array!!!
	var newPath = rotatePoly(polygon.getArray(),pivotPoint,angle);
	
	newPoly = new google.maps.Polygon({
        strokeColor: '#FF8C00',
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: '#FF8C00', //ORANGE
        fillOpacity: 0.25,
        visible: true,
		clickable: false
    });

	newPoly.setPath(newPath);
	
	//5 FIND THE COORD OF THE BOUNDING BOX
	var tempLatBBArray = new Array();
	var tempLngBBArray = new Array();
	
	for (var i=0;i<polygon.length; i++){
		//console.log("coord: "+polygonPaths.getAt(0).getAt(i).lat());
		tempLatBBArray.push(newPath[i].lat());
		tempLngBBArray.push(newPath[i].lng());
	}
			
	var minBBLat = Math.min.apply(null,tempLatBBArray), minBBLng = Math.min.apply(null,tempLngBBArray);
	var maxBBLat = Math.max.apply(null,tempLatBBArray), maxBBLng = Math.max.apply(null,tempLngBBArray);
	
	//6 DRAW THE BOUNDING BOX
	var BBpointA = new google.maps.LatLng(minBBLat,minBBLng);
	var BBpointB = new google.maps.LatLng(maxBBLat,maxBBLng);
	
	var BB_Bounds = new google.maps.LatLngBounds(BBpointA,BBpointB);
	
	var BB = new google.maps.Rectangle({bounds:BB_Bounds,fillColor:"#FF8C00",strokeColor:"#FF8C00",strokeOpacity:0.5,strokeWeight:2,fillOpacity:0.2});
	//BB.setMap(map);
	
	//7 DRAW THE PATH
	photo_size = {'X' : copter_param.elements["sizeX"].value, 'Y' : copter_param.elements["sizeY"].value };
	

	var overlap = copter_param.elements["overlap"].value;
	var altitude = copter_param.elements["altitude"].value ;
	var climbRate = copter_param.elements["climb"].value;
	var delayTime = copter_param.elements["delay"].value;
	var speed = copter_param.elements["speed"].value;
	
	var viewPort_NE = map.getBounds().getNorthEast();
	var viewPort_SW =  map.getBounds().getSouthWest();
	//we generate a rectangle arround the polygon (and a angle of rotation for the rectangle)
	mappingResult = GenerateMappingWaypoints(viewPort_NE,viewPort_SW,BBpointA,BBpointB,photo_size,
									overlap,altitude,climbRate,delayTime,speed);
	console.log(mappingResult);
									
	MappingWaypoints	= mappingResult.MappingWaypoints;
	
	//only keep the waypoints which actually fit inside the polygon
	for (var i=0;i<MappingWaypoints.length ;i++){
		if(pointInPolygon(polygon.getLength(),tempLngBBArray,tempLatBBArray,MappingWaypoints[i]) == false){
			corners = new Array();
			var remove = new Boolean();
			remove = false;
			var z = 0;
			//extra check if any of the corners of the waypoints being deleted in inside the polygon using Findcorners
			corners = Findcorners(MappingWaypoints[i],photo_size);
			//console.log("Check corners...");
	
			for (var z; z<corners.length; z++){
				if(pointInPolygon(polygon.getLength(),tempLngBBArray,tempLatBBArray,MappingWaypoints[i]) == true){
					//console.log("lat: "+corners[z].lat+"lng: "+corners[z].lng);	
					//console.log("Point is inside polygon");						
					remove = false;
					break;
				} else {
					//console.log("Point is not inside polygon");
					remove=true;
				}
			}
			
			if (remove == true){
				//remove wp from array
				MappingWaypoints.splice(i,1);
				i--;
			}
		}
	}
	
	//console.log("#0: "+MappingWaypoints.length);
	
	//8 MAKE POLY FROM 'RECTANGLE' BOUNDING BOX
	var rectBL = new google.maps.LatLng(BB.getBounds().getNorthEast().lat(),BB.getBounds().getNorthEast().lng());
	var rectBR = new google.maps.LatLng(BB.getBounds().getNorthEast().lat(),BB.getBounds().getSouthWest().lng());;
	var rectTR = new google.maps.LatLng(BB.getBounds().getSouthWest().lat(), BB.getBounds().getSouthWest().lng());
	var rectTL = new google.maps.LatLng(BB.getBounds().getSouthWest().lat(), BB.getBounds().getNorthEast().lng());;
	
	var rectPath = new Array();
	rectPath= [rectBL,rectBR,rectTR,rectTL];

	//9 ROTATE BOUNDING BOX BY ANGLE
	//rectPath
	var newPath = rotatePoly(rectPath,pivotPoint,-angle);
	newPoly = new google.maps.Polygon({
        strokeColor: '#32CD32',
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: '#32CD32', //GREEN
        fillOpacity: 0.25,
        visible: true,
		clickable: false
    });
	
	newPoly.setPath(newPath);
	
	//10 ROTATE THE WP
	var newWP = rotatePoly(MappingWaypoints,pivotPoint,-angle);
	
	//change the rotated WP in the MappingWaypoints array
	//console.log("#1: "+newWP.length);
	for (var i = 0; i<newWP.length; i++){
		MappingWaypoints[i].lat(newWP[i].lat());
		MappingWaypoints[i].lng(newWP[i].lng());
		//console.log(MappingWaypoints[i].lat(),MappingWaypoints[i].lng());
	}
	
	//PhotoArea = mappingResult.PhotoArea;
	//console.log("#elem"+MappingWaypoints.length);
	//console.log("#2: "+MappingWaypoints.length);
	var tail = new Array();
	var l = markersArray.length;
	if (prevShape.start != 0 || prevShape.end !=0){
		//is there a tail?
		if (prevShape.end != markersArray.length){
			//yes
			for (var j=prevShape.end; j<markersArray.length; j++){
				tail.push(markersArray[j]);
			}
			
		}
		//remove the old shape
		for (var j=prevShape.start; j<l; j++){
			path.removeAt(prevShape.start);
		}
		markersArray.splice(prevShape.start,l);	
	} 
		
	prevShape.start = markersArray.length;
		
	for (var i = 0; i<MappingWaypoints.length; i++){
		var coord = new google.maps.LatLng(MappingWaypoints[i].lat(),MappingWaypoints[i].lng());
		
						
		path.push(coord);
	
		var icon ='markerIcons/largeTDRedIcons/marker'+markersArray.length+'.png';
		
		// Add a new marker at the new plotted point on the polyline.
		var marker = new google.maps.Marker({
			position: coord,
			title: '#' + path.getLength(),
			map: map,
			dragable: false,
			clickable: true,
			name: name,
			raiseOnDrag: false,
			icon: icon,
			setZIndex: 20
		});
		
		
		//Do we need closure?
		google.maps.event.addListener(marker, 'click', (function(i,marker){
			return function (){
				
				var content = 	"<div id='markerWindow'>"+
				"<h2>WP " + (prevShape.start+i) + "</h2>"+
				"<p><label>Latitude</label><input type='text' value='" + MappingWaypoints[i].lat() +"' id='lat' /></p>"+
				"<p><label>Longitude</label><input type='text' value='" + MappingWaypoints[i].lng() +"' id='long' /></p>"+
				"<p><label>Climb Rate (0.1 m/s)</label><input type='text' value='" + MappingWaypoints[i].ClimbRate +"' id='ClimbRate'/></p>"+
				"<p><label>DelayTime (s)</label><input type='text' value='" + MappingWaypoints[i].DelayTime +"' id='DelayTime'/></p>"+
				"<p><label>Speed (0.1 m/s)</label><input type='text' value='" + MappingWaypoints[i].Speed +"' id='Speed'/></p>"+
				"</div>"
				
				infowindow.setContent(content);
				infowindow.open(map,marker);
				
			}

		})(i,marker));
		
		markersArray.push(marker);
			
		//make direction selectable; implement changeable structure: add path direction marker
		//selection bug
	}
	
	prevShape.end = markersArray.length;
	
	//add tail
	if (tail.length !=0){
		//reatach tail
		for (var j=0; j<tail.length; j++){
			
			
			var content = 	"<div id='markerWindow'>"+
							"<h2>WP " + i + "</h2>"+
							"<p><label>Latitude</label><input type='text' value='" + tail[j].position.lat() +"' id='lat' /></p>"+
							"<p><label>Longitude</label><input type='text' value='" + tail[j].position.lng() +"' id='long' /></p>"+
						//	"<p><label>Climb Rate (0.1 m/s)</label><input type='text' value='" + tail[j].ClimbRate +"' id='ClimbRate'/></p>"+
							//"<p><label>DelayTime (s)</label><input type='text' value='" + tail[j].DelayTime +"' id='DelayTime'/></p>"+
							//"<p><label>Speed (0.1 m/s)</label><input type='text' value='" + tail[j].Speed +"' id='Speed'/></p>"+
							"</div>"
							
			path.push(tail[j].position);
			
			var icon ='markerIcons/largeTDRedIcons/marker'+markersArray.length+'.png';
			
			// Add a new marker at the new plotted point on the polyline.
			var marker = new google.maps.Marker({
				position: tail[j].position,
				title: '#' + path.getLength(),
				map: map,
				dragable: false,
				clickable: true,
				name: name,
				raiseOnDrag: false,
				icon: icon,
				setZIndex: 20
			});
			
			
			//Do we need closure?
			google.maps.event.addListener(marker, 'click', function(content){
				return function (){
					infowindow.setContent(content);
					infowindow.open(map,marker);
					
				}
	
			})(content);
			
			markersArray.push(tail[j]);
		}
		
	}
	
	
	//add the markersArray to our wpArray
	var test = new Array();
	var number = wpArray.length;
	for (var i=0; i<markersArray.length; i++){
		number++;
		var position = ({
			"Latitude" : markersArray[i].position.lat(),
			"Longitude" : markersArray[i].position.lng(),
			"Altitude" : parseInt(copter_param.elements["altitude"].value),
			"Status" : 1 		
		});
		
		//TODO Need to add heading/toleranceRadius
		//TODO What is event_flag? type? WP_EventChannelData? CamAngle?
		
    	var wp = ({
    		"Position" : position,
    		"Heading" :0 ,
    		"ToleranceRadius" :10,
    		"HoldTime" : parseInt(copter_param.elements["delay"].value),
    		"Event_Flag" : 1,
    		"Index" : number,
    		"Type" : 0,              	
    		"WP_EventChanneldata" : 100,
    		"AltitudeRate" : parseInt(copter_param.elements["climb"].value),
    		"Speed" : parseInt(copter_param.elements["speed"].value),
    		"CamAngle" : 0,
    		"Name" :  0		
    	});
    	
		//test.push(wp);
		wpArray.push(wp);
	}
	//console.log(test);
	update_list();	
	
	
	
}

//pivotPoint is the point arround wich we will rotate: in our case it's 
//path: the array containing the polygon coord
function rotatePoly(path,pivotPoint, angle) {
	var newPath = [];
	for (var p = 0 ; p < path.length ; p++) {
		var pt = transposePoint(path[p],pivotPoint,angle);
		//console.log(pt.Xa,pt.Ya);
		newPath.push(pt);
	}
	
	return newPath;
	
}

function transposePoint(point,pivotPoint,angle) {
	//debug(point);
	var radius = distance(point,pivotPoint); // meters
	var a =  bearing(point,pivotPoint) + angle;
	with (Math) {
		var d = radius/6371000;	// circle radius in meters / meters of Earth radius = radians
		var lat1 = (PI/180)* pivotPoint.lat(); // radians
		var lng1 = (PI/180)* pivotPoint.lng(); // radians

		var tc = (PI/180)* a;
		var y = asin(sin(lat1)*cos(d)+cos(lat1)*sin(d)*cos(tc));
		var dlng = atan2(sin(tc)*sin(d)*cos(lat1),cos(d)-sin(lat1)*sin(y));
		var x = ((lng1-dlng+PI) % (2*PI)) - PI ;
		var p = new google.maps.LatLng(parseFloat(y*(180/PI)),parseFloat(x*(180/PI)));
		return p;
	}
}
function distance(a,b) {
	//console.log("1: "+a);
	//transform is needed because of google lat type definition
	var p1 = new google.maps.LatLng(a.lat(),a.lng());
	var distance = google.maps.geometry.spherical.computeDistanceBetween(p1, b);
	return distance;
}

function bearing(p1,p2) {
	with (Math) {
		var lat1 = p1.lat() * (PI/180);
		var lon1 = p1.lng() * (PI/180);
		var lat2 = p2.lat() * (PI/180);
		var lon2 = p2.lng() * (PI/180);

		var d = 2*asin(sqrt( pow((sin((lat1-lat2)/2)),2) + cos(lat1)*cos(lat2)*pow((sin((lon1-lon2)/2)),2)));
		var bearing = atan2(sin(lon1-lon2)*cos(lat2), cos(lat1)*sin(lat2)-sin(lat1)*cos(lat2)*cos(lon1-lon2))  / -(PI/180);
		bearing = bearing < 0 ? 360 + bearing : bearing;
		var bearing = 360 - bearing + 180; // 0 degrees at 3 o'clock and counting couterclockwise

	}
	return bearing;

}



// Calculate the direction angle of waypoint's direction w.r.t the horizon
function calculateAngle(dirP1, dirP2)
{
   angle = Math.atan2(dirP2.lat() - dirP1.lat(), dirP2.lng() - dirP1.lng());
   //console.log("angle "+angle);
   return angle;
}