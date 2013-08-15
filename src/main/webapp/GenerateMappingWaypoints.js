// FUNCTIONS//

function GenerateMappingWaypoints(NorthEast, SouthWest, StartingPoint, EndPoint, photo_size, Overlap, Attitude, ClimbRate, DelayTime,Speed)
{

console.log ("photo_size.X: "+photo_size.X);
console.log ("photo_size.X: "+photo_size.Y);





   // Bounds of the map - TORNIO.JPEG for testing
   Bottom_Left =
   {
     'lat' : SouthWest.lat(),  'lng' : SouthWest.lng()
   }
   ;

   // Top right
   Top_Right =
   {
      'lat' : NorthEast.lat(),'lng' : NorthEast.lng()
   }
   ;
   
   
	//var coord = new google.maps.LatLng(Bottom_Left.lat,Bottom_Left.lng);
	//var BL = new google.maps.Marker({ position: coord, map: map, title: 'Click to zoom' });
	//var coord = new google.maps.LatLng(Top_Right.lat,Top_Right.lng);
	//var BR = new google.maps.Marker({ position: coord, map: map, title: 'Click to zoom' });

   // Top left - for calculation the map size
   // we had to swap Top_Right and Bottom_Left even tough it doesn't make any sense; but it works
   Top_Left =
   {
      'lat' : Top_Right.lat , 'lng' : Bottom_Left.lng 
   }

	var coord = new google.maps.LatLng(Top_Left.lat,Top_Left.lng);
	var TL = new google.maps.Marker({ position: coord, map: map, title: 'Click to zoom' });
   // Map size in meter

   map_size =
   {
      'X' : Math.round(Distance(Top_Left, Top_Right), 0),
      'Y' : Math.round(Distance(Bottom_Left, Top_Left), 0)
   }
   ;
   
   //
   starting_point_gps =
   {
      'lat' : StartingPoint.lat(),'lng' : StartingPoint.lng() 
   }
   end_point_gps =
   {
      'lat' : EndPoint.lat(),'lng' : EndPoint.lng()
   }
   

   // Array to store waypoint list
   var MappingWaypoints = new Array();

   // Calculate starting point and end point in Meters
   temp_point1 =
   {
      'lng' : starting_point_gps.lng, 'lat' : Bottom_Left.lat
   }

   temp_point2 =
   {
      'lng' : Bottom_Left.lng, 'lat' : starting_point_gps.lat
   }

   temp_point3 =
   {
      'lng' : end_point_gps.lng, 'lat' : Bottom_Left.lat
   }

   temp_point4 =
   {
      'lng' : Bottom_Left.lng, 'lat' : end_point_gps.lat
   }

   starting_point =
   {
      'X' : Distance(temp_point1, Bottom_Left), 'Y' : Distance(temp_point2 , Bottom_Left)
   }
   ;
   end_point =
   {
      'X' : Distance(temp_point3, Bottom_Left), 'Y' : Distance(temp_point4 , Bottom_Left)
   }

	
	
   // Calculate the mapping area
   mapping_area =
   {
      'X' : end_point.X - starting_point.X, 'Y' : Math.abs(end_point.Y - starting_point.Y)
   }
   ;
   
   console.log("mapping area: " + mapping_area.X + "; " + mapping_area.Y);
   
    console.log("PRINT: ",Math.abs(end_point.Y-starting_point.Y));

   // Convert overlap from percentage to meter
   overlap_distance = SolveOverlapDistance(photo_size,Overlap);
   
   console.log("overlap distance: " + overlap_distance);


   // Distance between 2 points (meter)
   points_distance =
   {
      'X' : photo_size.X - overlap_distance, 'Y' : photo_size.Y - overlap_distance
   }
   ;
   console.log("point distance: " + points_distance.X + "," + points_distance.Y);

	
   // Init 1st point and be used storing temp. point
   current_point =
   {
      'X' : starting_point.X + (photo_size.X*0.5) , 'Y' : starting_point.Y + (photo_size.Y*0.5)
   }
   ;
   // Number of points on each axis

   no_of_points =
   {
      'X' : RoundUp(parseInt(mapping_area.X - photo_size.X + 2*overlap_distance, 10), parseInt(points_distance.X, 10) )+1, 'Y' : RoundUp(parseInt(mapping_area.Y - photo_size.Y +  2*overlap_distance, 10) , parseInt(points_distance.Y, 10))+1
   }
   ;
   console.log("no_of_points X: "+no_of_points.X);
   console.log("no_of_points Y: "+no_of_points.Y);
 

   // A smart way to adapt to small mapping area : D
   if ((mapping_area.X < photo_size.X) && (mapping_area.Y < photo_size.Y))
   {
      no_of_points.X = 1;
      no_of_points.Y = 1;
      current_point.X = starting_point.X + mapping_area.X * 0.5 ;
      current_point.Y = starting_point.Y + mapping_area.Y * 0.5 ;

   }
   else if (mapping_area.X < photo_size.X)
   {
      no_of_points.X = 1;
      current_point.X = starting_point.X + mapping_area.X * 0.5 ;

   }
   else if (mapping_area.Y < photo_size.Y)
   {
      no_of_points.Y = 1;
      current_point.Y = starting_point.Y + mapping_area.Y * 0.5;

   }
   else
   {
   }

   // Temp var. to store the current point - GPS
   current_point_gps = MeterstoGPS(current_point);

   // Total points
   total_points = no_of_points.X * no_of_points.Y;
   //console.log(total_points);

   // Flight time in second
   flight_time_sec = (Attitude / (0.1 * ClimbRate)) + (((no_of_points.X - 1) * points_distance.X * no_of_points.Y + (no_of_points.Y - 1) * points_distance.Y) / (0.1 * Speed) + total_points * DelayTime);

   // Calculate the area generating by combination of all taken photos (bigger than the mapping area)
   starting_photo_area =
   {
      'X' : current_point.X - photo_size.X * 0.5, 'Y' : current_point.Y - photo_size.Y * 0.5
   }
   ;

   end_photo_area =
   {
      'X' : current_point.X + (no_of_points.X - 1) * points_distance.X  + photo_size.X * 0.5, 'Y' : current_point.Y + + (no_of_points.Y - 1) * points_distance.Y +  photo_size.Y *0.5
   }
   ;
   

   /////////// Main code to generate waypoints///////////

   // Point index
   point = 0;

   for (var j = 1; j <= no_of_points.Y; j ++ )
   {
      // Generate by rows
      for (var i = 1; i <= no_of_points.X; i ++ )
      {
		 
		
		
	
		 
         // Add item to the Waypoint list
         MappingWaypoints.push(
         {
            lat: (function(v) 
						{	return function()	
							{	
								if(arguments.length) { 
									v = arguments[0]; 
								} else { return v; }
				
							}
						}	)(current_point_gps.lat),
					
			lng: (function(v) 
						{	return function()	
							{	
								if(arguments.length) { 
									v = arguments[0]; 
								} else { return v; }
				
							}
						}	)(current_point_gps.lng),		
          
						
            Radius : 10,
            Altitude : Attitude,
            ClimbRate : ClimbRate,
            DelayTime : DelayTime,
            WP_Event_Channel_Value : 100,
            Heading : 0,
            Speed : Speed,
            CAM_Nick : 0,
            Type : 1,
            Prefix : "P"
			
         }
         );
		 
		 
		 

         if (i == no_of_points.X)
         break;

         point ++ ;

         // Direction of increasing waypoint position (left - right of right - left)
         if (j % 2 == 1)
         current_point.X += points_distance.X;
         else
         current_point.X -= points_distance.X;

         current_point_gps = MeterstoGPS(current_point);

      }

      // Row full - jump to the next col.
      point ++ ;
      current_point.Y  += points_distance.Y;
      current_point_gps = MeterstoGPS(current_point);
   }
	
	//console.log(MappingWaypoints.length);	
	//console.log("(gen)array_lat" + MappingWaypoints[1].lat());
	//console.log("(gen)array_long" + MappingWaypoints[1].lng());
	
	var result = new Array();
	result = {
		'MappingWaypoints': MappingWaypoints,
		'Flightime': flight_time_sec,
		'PhotoArea': {	'SouthWest': MeterstoGPS(starting_photo_area),
						'NorthEast': MeterstoGPS(end_photo_area)},
		'PhotoSize': photo_size
	};
	
   return result;
}

// Calculate overlap from percentage to meter
function SolveOverlapDistance(photo_size, overlap)
{
   delta = (photo_size.X + photo_size.Y) * (photo_size.X + photo_size.Y) - 4 * overlap * 0.01 * photo_size.X * photo_size.Y;
   d = ( (photo_size.X + photo_size.Y) - Math.sqrt(delta) ) * 0.5;
   return d;
}

// Round up a division
function RoundUp( x, y )
{
   roundValue = Math.ceil(x / y);
   return roundValue;
}

// Convert from local coordinate (Meter) to GPS
function MeterstoGPS(Meters_position)
{
   GPS_pos =
   {
      'lng'  : Number(Bottom_Left.lng, 10) + (Number(Meters_position.X, 10)/Number(map_size.X, 10)) * Number(Top_Right.lng - Bottom_Left.lng, 10),
      'lat'  : Number(Bottom_Left.lat, 10) + (Number(Meters_position.Y, 10)/Number(map_size.Y, 10)) * Number(Top_Right.lat - Bottom_Left.lat, 10)
   }
   ;
   
   var _BL = new google.maps.LatLng(Bottom_Left.lat,Bottom_Left.lng);

   test = {
		   'lng':google.maps.geometry.spherical.computeOffset(_BL,Meters_position.X,90).lng(),
		   'lat':google.maps.geometry.spherical.computeOffset(_BL,Meters_position.Y,0).lat()
   };
 
   console.log(GPS_pos);
   console.log(test);
   return test;
}

// Distance between 2 GPS positions
function Distance(Point1, Point2)
{
	
   lat1 = Point1.lat;
   lat2 = Point2.lat;
   lng1 = Point1.lng;
   lng2 = Point2.lng;
 	
	var thomas = new google.maps.LatLng(lat1,lng1);
	var longcao = new google.maps.LatLng(lat2,lng2);
	var distance = google.maps.geometry.spherical.computeDistanceBetween(thomas, longcao);
   return distance;
}

function DegreesToRadians(degrees)
{
   degToRadFactor = Math.PI/180;
   return degrees * degToRadFactor;
}

function GPStoMeters(GPS_position){

   //console.log(GPS_position.lat(),GPS_position.lng());
   temp_point1 =
   {
      'lng' : GPS_position.lng(), 'lat' : Bottom_Left.lat
   }

   temp_point2 =
   {
      'lng' : Bottom_Left.lng, 'lat' : GPS_position.lat()
   }
	   Meter_position =
   {
      'X' : Distance(temp_point1, Bottom_Left), 'Y' : Distance(temp_point2 , Bottom_Left)
   }
   ;
   /**
   var tmp1 = new google.maps.Marker({
		position: new google.maps.LatLng(temp_point1.lat,temp_point1.lng),
		map: map,
		dragable: false,
		clickable: true,
		name: "p1",
		raiseOnDrag: false,
		setZIndex: 20
	});
	
   var tmp2 = new google.maps.Marker({
		position: new google.maps.LatLng(temp_point2.lat,temp_point2.lng),
		map: map,
		dragable: false,
		clickable: true,
		name: "p2",
		raiseOnDrag: false,
		setZIndex: 20
	});
	**/
	return Meter_position;
	
	
	}
	
	
function Findcorners(centerpoint,photosize)
{
	corner = new Array();
	corner_gps = new Array();
	
	centerpoint_meter = GPStoMeters(centerpoint);
	
	corner.push(
	{
		X:  parseInt(centerpoint_meter.X)-parseInt(photosize.X)/2, Y : parseInt(centerpoint_meter.Y)-parseInt(photosize.Y)/2
		}
	);
	
	corner.push(
	{
		X:  parseInt(centerpoint_meter.X)+parseInt(photosize.X)/2, Y : parseInt(centerpoint_meter.Y)-parseInt(photosize.Y)/2
	});
	
	corner.push(
	{
		X:  parseInt(centerpoint_meter.X)+parseInt(photosize.X)/2, Y : parseInt(centerpoint_meter.Y)+parseInt(photosize.Y)/2
		}
	);

	corner.push(
	{
		X:  parseInt(centerpoint_meter.X)-parseInt(photosize.X)/2, Y : parseInt(centerpoint_meter.Y)+parseInt(photosize.Y)/2
		}
	);
	
	console.log(corner);
	
	for (var i=0; i<4;i++)
	{
		corner_gps.push(MeterstoGPS(corner[i]));
		}
	
			
			
	return corner_gps;

}

