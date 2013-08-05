// THIS GENERATES THE ELEVATION PROFILE CHART
/**
* Used: Experimental Draggable points plugin with touch 
* http://jsfiddle.net/9F3YQ/
*/

//TODO: Communicatie tussen google maps & profile.js >> waarschijnlijk id meegeven

var hasTouch = 'ontouchstart' in window,
    START = 'mousedown',
    MOVE = 'mousemove',
    END = 'mouseup';

if (hasTouch) {
    START = 'touchstart';
    MOVE = 'touchmove';
    END = 'touchend';
}

function normalizeEvent(e) {
    var props = ['clientX', 'clientY', 'pageX', 'pageY'],
        i, l, n;
    
    if (['touchstart', 'touchmove', 'touchend'].indexOf(e.type) > -1) {
        for (i = 0, l = props.length; i < l; i++) {
            n = props[i];
            e[n] = e.originalEvent.targetTouches[0][n];
        }
    }
    
    return e;
}



(function(Highcharts) {
    var addEvent = Highcharts.addEvent,
        each = Highcharts.each;
    
    /**
     * Filter by dragMin and dragMax
     */
    function filterRange(newY, series) {
        var options = series.options,
            dragMin = options.dragMin,
            dragMax = options.dragMax;
        
        if (newY < dragMin) {
            newY = dragMin;
        } else if (newY > dragMax) {
            newY = dragMax;
        }
        return newY;
    }
    
    Highcharts.Chart.prototype.callbacks.push(function (chart) {        
        
        var container = chart.container,
            dragPoint,
            dragY,
            dragPlotY,
            dragPoint1,
            dragPlotY1;
        
        // my code:
        var dragPointSeries;
        var dragSeries;
        
        chart.redraw(); // kill animation (why was this again?)
        
        addEvent(container, START, function(e) {
            e = normalizeEvent(e);
            var hoverPoint = chart.hoverPoint;
            if (hoverPoint && hoverPoint.series.options.draggable) {
                dragSeries = false;
                dragPoint = hoverPoint;
                dragY = e.pageY;
                dragPlotY = dragPoint.plotY + (chart.plotHeight - (dragPoint.yBottom || chart.plotHeight));
            }
        });    
                
        addEvent(container, MOVE, function(e) {
            e = normalizeEvent(e);
            if (dragPoint) {
                if (dragSeries) {
                    var deltaY = dragY - e.pageY,
                        newPlotY = chart.plotHeight - dragPlotY + deltaY,
                        newY = dragPoint.series.yAxis.translate(newPlotY, true),
                        series = dragPoint.series;
                    
                    // my code:
                    for (var i = 0; i < dragPoint.series.points.length; i++) {
                        var deltaYtmp = dragY - e.pageY,
                            newPlotYtemp = chart.plotHeight - dragPointSeries[1][i] + deltaYtmp,
                            newYtmp = dragPointSeries[0][i].series.yAxis.translate(newPlotYtemp, true);
                            
                            newYtmp = filterRange(newYtmp, series);
                            dragPointSeries[0][i].update(newYtmp, false);
                            chart.tooltip.refresh(dragPointSeries[0][i]);
                    }                        
                    // end of my code                                            
                    
                    if (series.stackKey) {
                        chart.redraw();
                    } else {
                        series.redraw();
                    }    
                }else{
                    var deltaY = dragY - e.pageY,
                        newPlotY = chart.plotHeight - dragPlotY + deltaY,
                        newY = dragPoint.series.yAxis.translate(newPlotY, true),
                        series = dragPoint.series;
                    newY = filterRange(newY, series);                
                    dragPoint.update(newY, false);                
                    chart.tooltip.refresh(dragPoint);
                    
                    if (series.stackKey) {
                        chart.redraw();
                    } else {
                        series.redraw();
                    }        
                }
            }
        });
        
        function drop(e) {
            e = normalizeEvent(e);
            if (dragPoint) {
                var deltaY = dragY - e.pageY,
                    newPlotY = chart.plotHeight - dragPlotY + deltaY,
                    series = dragPoint.series,
                    newY = series.yAxis.translate(newPlotY, true);                            
                    
                    // my code:
                    //moveConsecutiveDots(dragPlotY, deltaY);    
                    // end of my code                
                    
                newY = filterRange(newY, series);
                dragPoint.firePointEvent('drop');
                dragPoint.update(newY);                
                dragPoint = dragY = undefined;
            }
        }
        function moveConsecutiveDots(dragPlotY, deltaY) {
            for (var i = dragPoint.x + 1; i < dragPoint.series.points.length; i++) {                
                var    point = dragPoint.series.points[i];            
                var newPlotY = chart.plotHeight - dragPointSeries.points[i].plotY + deltaY ;
                var newY = point.series.yAxis.translate(newPlotY, true);
                newY = filterRange(newY, dragPoint.series);                
                point.update(newY, false);                                
            }
        }
        addEvent(document, END, drop);
        addEvent(container, 'mouseleave', drop);
    });
    
    /**
     * Extend the column chart tracker by visualizing the tracker object for small points
     */
    var colProto = Highcharts.seriesTypes.column.prototype,
        baseDrawTracker = colProto.drawTracker;
    
    colProto.drawTracker = function() {
        var series = this;
        baseDrawTracker.apply(series);
        
        each(series.points, function(point) {
            point.tracker.attr(point.shapeArgs.height < 3 ? {
                'stroke': 'black',
                'stroke-width': 2,
                'dashstyle': 'shortdot'
            } : {
                'stroke-width': 0
            });
        });
    };
    
})(Highcharts);

//input: elevationData; CopterAltitudeData;
function generateChart(elevationData,CopterAltitudeData,dragMax,dragMin){
		var chart = new Highcharts.Chart({
		chart: {
			renderTo: 'container',
			animation: false
		},
		title: {
			text:'Elevation Profile'
		},
		xAxis: {
			categories: ['HOME', 'Waypoint 1', 'Waypoint 2', 'Waypoint 3', 'Waypoint 4', 'Waypoint 5', 'Waypoint 6', 'Waypoint 7', 'Waypoint 8', 'Waypoint 9']
		},
		
		yAxis: {
			title: {
				text: 'Altitude',
				minPadding: 1
			}
		},
			
		plotOptions: {
			series: {
				cursor: 'ns-resize',
				point: {
					events: {
						
						drop: function() {
							$('#report').html(
								this.category + ' was set to ' + Highcharts.numberFormat(this.y, 2)
							);
						},
						
						mouseOver: function() {
							if (this.series.name == "Copter Altitude" && this.config[0]){
								if (!this.config[2]){
									showMarker(this.config[0]);
								} else {
									showMarker(this.config[2]);	
								}
							}                       
                        }
						
						 

					}
				}
			},
			column: {
				stacking: 'normal'
			}
		},
		
		tooltip: {
			enabled: true,
			animation: false,
			yDecimals: 0,
			positioner: function () {
                return { x: 80, y: 50 };
            },
			valueSuffix: ' meter',
			borderRadius: 0
		},
		series: [
			
		{
			name: "Google Elevation Data",
			data: elevationData,
			draggable: false,
			dragMin: 0,
			type: 'column',
			shadow:false,
			zIndex:0
		},
			
		{
			name: "Copter Altitude",
			data: CopterAltitudeData,
			draggable: true,
			dragMin: dragMin,
			dragMax: dragMax, //height max can be set
			type: 'line',
			zIndex:1,
			dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return Math.round((this.y)) +'m';
                    },
					y:-5
                }
		}]
	});
}

