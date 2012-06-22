logging('Start of App.JS file');

logging('Defining Local Settings...');
//local settings
localStore("xdms_url", "save", "http://rotas.inmadeira.com/rest/rest");
localStore("sessionID", "save", "255627D11FB9AA52B805CB3644388EC0");
localStore("attractions", "del");

logging('Setting Global Vars...');
//Global Vars
var globalSession = "255627D11FB9AA52B805CB3644388EC0";
var userData = null;
var map = null;
var mapRefreshTimeout = 1000*30; //1000*60;//1 minute
var mapRefresher = null;
var lastPos = null;
var coordRangeRadiusNear   = 0.009;  // 1 Km
var coordRangeRadiusNormal = 0.018;  // 2 Km
var coordRangeRadiusFar    = 0.0451; // 5 Km
var flaggedRoute = null;
var coordDiff = coordRangeRadiusNormal;
/*var mapRef = {
  maxLat: 32.70332526710, 
  minLat: 32.63049302429,
  maxLog: -16.9610115921,
  minLog: -16.8573281204,
  mapWidth: 300,
  mapHeight: 250,
  divWidth: 300,
  divHeight: 250
};*/
var mapRef = {
  maxLat: 32.71398724975606,//coord
  minLat: 32.62987085008971,//coord
  maxLog: -16.816040746861677,//coord
  minLog: -16.96908982726818,//coord
  minZoom: 100,//%
  maxZoom: 1500,//%
  maxZoomMaxLat: 32.649597242300814,//coord
  maxZoomMinLat: 32.64150283618975,//coord
  maxZoomMaxLog: -16.907122360119626,//coord
  maxZoomMinLog: -16.922614799389645,//coord
  mapWidth: 2433,//px
  mapHeight: 1589,//px
  /*mapWidth: 1792,//px
  mapHeight: 1159,//px*/
  divWidth: 300,//px
  divHeight: 194//px
};

logging('Global Vars were difined successfully');

function showStartScreen()
{
  logging('Starting showStartScreen Function...');
  
  highlightMenu("");
  
  document.getElementById('mapdiv').style.display = 'none';
  document.getElementById('content').style.display = 'block';
  
  var htmlContent = "";
  
  htmlContent += "<h1 id='appTitle'>"+l('title')+"</h1>";
  
  htmlContent += "<h3>"+l('wellcomeMSG1')+"</h3>";
  htmlContent += "<p>"+l('wellcomeMSG2')+"</p>";
  
  document.getElementById('content').innerHTML = htmlContent;

  logging('Ending showStartScreen Function...');
  setHistoryLastFnc("showStartScreen()");
}

function loadMenu()
{
  //load menu
  var menuHtml = "";
  menuHtml += "<div id='showRoutesBtn' onclick='showRoutes()'>"+l('routes')+"</div>";
  menuHtml += "<div id='showPoisBtn' onclick='showPois()'>"+l('around')+"</div>";
  menuHtml += "<div id='showLocalBtn' onclick='showLocal()'>"+l('signLoc')+"</div>";
  menuHtml += "<div id='showSettingsBtn' onclick='showSettings()'>"+l('settings')+"</div>";
  /*menuHtml += "<div onclick='showLog()'>LOG</div>";*/
  document.getElementById('menu').innerHTML = menuHtml;
}

function exit(){
  try{ navigator.app.clearHistory(); }catch(ex){}
  try{ navigator.app.clearCache(); }catch(ex){}
  try{ navigator.app.exitApp(); }catch(ex){}
}

function showLog()
{
  document.getElementById('mapdiv').style.display = "none";
  document.getElementById('content').style.display = "block";
  
  $fh.data( {
    "key": "log"
  }, function (res) {
    var log = res.val;
    document.getElementById('content').innerHTML = log;
    
  }, function (code) {
    document.getElementById('content').innerHTML = "Error reading the log file, " + code;
  });
}

/*
function showMap()
{
  $fh.data( {
    "key": "last_position"
  }, function (res) {
    var last_pos = JSON.parse(res.val);
    
    if(last_pos && !isNaN(last_pos.lat) && !isNaN(last_pos.log))
    {      
      $fh.map({
        target: 'mapdiv',
        lat: last_pos.lat,
        lon: last_pos.log,
        zoom: 14
      }, function (res) {
        map = res.map;
        document.getElementById('content').style.display = "none";
        document.getElementById('mapdiv').style.display = "block";
        var posToMap = new google.maps.LatLng(last_pos.lat, last_pos.log);
        var marker = new google.maps.Marker({
          position: posToMap,
          map: map,
          title: "Your Location"
        });
        
      }, function (error) {
        // something seriously wrong here. Show error
        document.getElementById('content').innerHTML = "Error displaying the map, Error:("+error+").<br/>Note that you have to be connected to internet to view the map!";
      });       
    }
    else
    {
      document.getElementById('mapdiv').style.display = "none";
      document.getElementById('content').innerHTML = "Couldn't show the map because it was impossible to get your current GPS position!";
    }
  }, function (code) {
    document.getElementById('content').innerHTML = "Error reading config var 'last_position', " + code;
  });
}*/

function showLocal()
{
  if(mapRefresher != null)
    window.clearInterval(mapRefresher);
    
  logging('Starting showLocal Function...');
  
  highlightMenu("showLocalBtn");

  document.getElementById('mapdiv').style.display = "none";
  document.getElementById('content').style.display = "block";
  
  if(flaggedRoute != null)
  {
    float("confirm", l("title"), l("askNewPoi"), "", "editRoute(\""+flaggedRoute.id+"\", "+true+");", "manageYourRoutes()");
  }
  else
  {
    float("confirm", l("title"), l("askNewRoute"), "", "showNewRouteFloat()", "manageYourRoutes()");
  }
  
  var htmlContent = "";
  
  document.getElementById('content').innerHTML = htmlContent;
  
  logging('Ending showLocal Function...');
  setHistoryLastFnc("showLocal()");
    
}

function showNewRouteFloat()
{
  var newRouteHTML = "Name:&nbsp;<input id='name' name='name' type='text' ><br><br>";
  newRouteHTML += "<div class='exitBtn' style='display: inline-block;' id='newRoute' onclick='newRoute(); floatClose();' >"+l("newRoute")+"</div><br><br>";
  float("custom", l("title"), l("title"), objEncode(newRouteHTML));
}

function showRoutes()
{
  if(mapRefresher != null)
    window.clearInterval(mapRefresher);
  
  logging('Starting showRoutes Function...');
  
  highlightMenu("showRoutesBtn");
  
  document.getElementById('mapdiv').style.display = "none";
  document.getElementById('content').style.display = "block";
  
  var htmlContent = "<h3>"+l("localRoutes")+"</h3>";
  
  htmlContent += "<div class='exitBtn' id='manageRoutes' onclick='manageYourRoutes()' >"+l("manageRoutes")+"</div><br><br><hr>";
  
  var localRoutes = localStore("local_routes");
  if(localRoutes && isArray(localRoutes) && localRoutes.length > 0)
  {
    for(var i=0; i<localRoutes.length; i++)
    {
      var route = localRoutes[i];
      htmlContent += "<div class='routeContainer'>";
      htmlContent += "<div class='remLocalRoute' onclick='removeLocalRoute("+i+")'></div>";
      htmlContent += "<div id='route' class='route' onclick='viewLocalRoute("+i+")'>" + route.title + "</div>";
      htmlContent += "</div>";
    }    
  }
  else
  {
    htmlContent += "<br><br>" + l("noRoutesToShow");//"No routes to show...";
  }
  document.getElementById('content').innerHTML = htmlContent;
  
  logging('Ending showRoutes Function...');
  setHistoryLastFnc("showRoutes()");
}

function viewLocalRoute(routeIndex)
{
  if(mapRefresher != null)
    window.clearInterval(mapRefresher);
  //mapRefresher = window.setInterval("viewLocalRoute("+routeIndex+")", mapRefreshTimeout);  
  
  logging('Starting viewLocalRoute Function...');
  
  var localRoutes = localStore("local_routes");
  
  var route = localRoutes[routeIndex];
  var pois = route.route.points_of_interest.point_of_interest;
  
  //var htmlContent = "<div id='showMapBtn' class='button'>"+l("showDynMap")+"</div>";
  var htmlContent = "<div id='mapOptBtn' class='mapOff'></div>";
  
  showMapInRoute(objEncode(pois), true);
  document.getElementById('mapdiv').style.display = 'block';
  
  htmlContent += "<h3>"+route.title+"</h3>";
  if(route.description && route.description != "")
    htmlContent += "<p>"+route.description+"</p>";
  htmlContent += "<h3>"+l("pois")+"</h3><br><hr><br>";
  
  if(isArray(pois) && pois.length > 0)
  {
    for(var i=0; i<pois.length; i++)
    {
      var poi = pois[i];
      //var img = localStore("media_content").pois["'"+poi.id+"'"] ? localStore("media_content").pois["'"+poi.id+"'"] : false;
      //htmlContent += "<br/>" + JSON.stringify(poi);
      
      var backFunct = "viewLocalRoute("+routeIndex+")";
      htmlContent += "<div id='poi_"+poi.id+"' class='poi' onclick='showPoi("+routeIndex+", "+i+")'>";
      /*
      if(img && img != null)
        htmlContent += "<img src='"+img.path+"' height='50px'></img>";
        //htmlContent += "<img src='data:"+img.type+";base64,"+img.content+"' height='50px' ></img>";
      */
      
      //case just one poi in the route, transform to array
      if(poi.elements && poi.elements.info_element && !isArray(poi.elements.info_element) && typeof(poi.elements.info_element.id) == "number"){
        var tmpEle = poi.elements.info_element;
        poi.elements.info_element = Array();
        poi.elements.info_element.push(tmpEle);
      }
      
      var mapIcon = "";
      if(i==0)
        mapIcon = "green";
      else if(i==pois.length-1)
        mapIcon = "red";
      else
        mapIcon = "gray";
      mapIcon += (i+1)<10 ? "0"+(i+1) : (i+1);
      
      htmlContent += "<img style='float: left;' src='css/icons/"+mapIcon+".png'/>";
     
      
      if(localStore('show_images') && isArray(poi.elements.info_element) && poi.elements.info_element.length > 0)
      {
        htmlContent += "<img id='"+poi.id+"' style='display: none; height: 50px;' src='"+poi.elements.info_element[Math.floor(Math.random()*poi.elements.info_element.length)].path+"'/>";
        displayPics(poi.id);
      }
      
      htmlContent += "<h3>" + poi.name + "</h3>";
      htmlContent += "<p>";
      if(poi && poi.description && poi.description.split(" ").length>20)
      {
        for(k=0;k<20; k++)
            htmlContent += poi.description.split(" ")[k] + " ";    
        htmlContent += "...";
      }else if(poi && poi.description && poi.description != "")
      {
        htmlContent += poi.description;
      }
      
      htmlContent += "</p>";
      
      //htmlContent += "<p>" + JSON.stringify(poi) + "</p>";
       
      htmlContent += "</div>";
    }
  }
  document.getElementById('content').innerHTML = htmlContent;
  
  var btn = document.getElementById('mapOptBtn');
  var action = "showMapInRoute('"+objEncode(pois)+"')";
  if(btn.attachEvent){
     btn.attachEvent("onclick", action);
  } else {
     btn.setAttribute("onclick", action);
  }  
  
  logging('Ending viewLocalRoute Function...');
  setHistoryLastFnc("viewLocalRoute("+routeIndex+")");
}

function refreshPois(funct){
  if(mapRefresher != null)
    window.clearInterval(mapRefresher);
  mapRefresher = window.setInterval(function(){
      var pos = localStore("last_position");
      if(lastPos && (dataToSave.lat == lastPos.lat || dataToSave.log == lastPos.log))
        eval(funct);
    }, mapRefreshTimeout);
}


function showPois()
{
  refreshPois("showPois()");
  startLoading();
  
  logging('Starting showPois Function...');
  
  highlightMenu("showPoisBtn");
  
  var last_pos = localStore("last_position");
  var localRoutes = localStore("local_routes");
  var poisToShow = Array();
  
  var maxPois = 20;
  var poiCounter = 0;
  
  if(localRoutes && isArray(localRoutes) && localRoutes.length > 0)
  {
    if(last_pos && !isNaN(last_pos.lat) && !isNaN(last_pos.log))
    {
      for(var i=0; i<localRoutes.length; i++)
      {
        var pois = localRoutes[i].route.points_of_interest.point_of_interest;
        if(isArray(pois) && pois.length > 0)
        {
          for(var p=0; p<pois.length; p++)
          {
            var poi = pois[p];
            //check location
            /*compare poi locations with users location using rectangle method
            if(poi.location.location_x < (last_pos.lat + coordDiff) && poi.location.location_x > (last_pos.lat - coordDiff))
              if(poi.location.location_y < (last_pos.log + coordDiff) && poi.location.location_y > (last_pos.log - coordDiff))  */
            
            //compare poi locations with users location using circle method
            var diffBetwPoints = Math.sqrt(Math.pow(last_pos.lat - poi.location.location_x, 2) + Math.pow(last_pos.log - poi.location.location_y, 2));
            poi.localRouteIndex = i;
            poi.routePoiIndex = p;
            if(diffBetwPoints < coordDiff)
              poisToShow.push(poi);
            
            if(poiCounter < maxPois-1)
              poiCounter++;
            else
            {
              p = pois.length;
              i = localRoutes.length;
            }
          }             
        }
      } 
      
      //re-order pois by the distance from pda last position
      for(var k = 0; k<poisToShow.length; k++)
      {
        for(var j = 0; j<poisToShow.length; j++)
        {
          if(
            calcCoordDistances(poisToShow[k].location.location_x, poisToShow[k].location.location_y, last_pos.lat, last_pos.log)
            <
            calcCoordDistances(poisToShow[j].location.location_x, poisToShow[j].location.location_y, last_pos.lat, last_pos.log)
            )
          {
            var tmp = poisToShow[j];
            poisToShow[j] = poisToShow[k];
            poisToShow[k] = tmp;
          }
        }
      }
    }else{
      stopLoading();
      float("", l("title"), l("noGPS"), "", "", "");
    } 
  }else{
    stopLoading();
    float("", l("title"), l("downRouteBeforePois"), "", "", "");
  }

  //document.getElementById('mapdiv').style.display = "none";
  document.getElementById('content').style.display = "block";

  var htmlContent = "";
  
  if(poisToShow.length > 0)
  {
    htmlContent += "<div id='showMapOptBtn' class='mapOptions'></div>";
    htmlContent += "<div id='mapOptBtn' class='mapOff'></div>";
    
    showMapInRoute(objEncode(poisToShow), true, true);
    document.getElementById('mapdiv').style.display = 'block';
    
    for(var i=0; i<poisToShow.length; i++)
    {
      var poi = poisToShow[i];
      var backFunct = "showPois()";
      
      var mapIcon = "";
      /*
      if(i==0)
        mapIcon = "green";
      else if(i==poisToShow.length-1)
        mapIcon = "red";
      else*/
        mapIcon = "gray";
      mapIcon += (i+1)<10 ? "0"+(i+1) : (i+1);
      
      htmlContent += "<div id='poi_"+poi.id+"' class='poi' onclick='showPoi("+poi.localRouteIndex+", "+poi.routePoiIndex+")'>";
      htmlContent += "<img src='css/icons/"+mapIcon+".png' />" + poi.name; 
      htmlContent += "</div>";
    }
  }else{
    document.getElementById('mapdiv').style.display = 'none';
    htmlContent += "<h3>"+l("poisNotFound")+"</h3>";
    htmlContent += "<div id='showMapOptBtn' class='mapOptions' style='display: relative; margin: 0; right: auto; left: auto;'></div>";
  }

  document.getElementById('content').innerHTML = htmlContent;

  var mapOptHtml = "<p>"+l("rangeMsg")+"</p>";

  if(coordDiff == coordRangeRadiusNear){
    mapOptHtml += "<div class='bigBtn' style='color: green;' onclick='coordDiff=coordRangeRadiusNear; showPois();floatClose();'>"+l("near")+" (1 km)</div>";
    mapOptHtml += "<div class='bigBtn poiScale' onclick='coordDiff=coordRangeRadiusNormal; showPois();floatClose();' >"+l("normal")+" (2 km)</div>";
    mapOptHtml += "<div class='bigBtn poiScale' onclick='coordDiff=coordRangeRadiusFar; showPois(); floatClose();' >"+l("far")+" (5 km)</div>";
  }else if(coordDiff == coordRangeRadiusNormal){
    mapOptHtml += "<div class='bigBtn' onclick='coordDiff=coordRangeRadiusNear; showPois(); floatClose();'>"+l("near")+" (1 km)</div>";
    mapOptHtml += "<div class='bigBtn poiScale' style='color: green;' onclick='coordDiff=coordRangeRadiusNormal; showPois(); floatClose();'>"+l("normal")+" (2 km)</div>";
    mapOptHtml += "<div class='bigBtn poiScale' onclick='coordDiff=coordRangeRadiusFar; showPois(); floatClose();'>"+l("far")+" (5 km)</div>";
  }else{
    mapOptHtml += "<div class='bigBtn' onclick='coordDiff=coordRangeRadiusNear; showPois(); floatClose();'>"+l("near")+" (1 km)</div>";
    mapOptHtml += "<div class='bigBtn poiScale' onclick='coordDiff=coordRangeRadiusNormal; showPois(); floatClose();'>"+l("normal")+" (2 km)</div>";
    mapOptHtml += "<div class='bigBtn poiScale' style='color: green;' onclick='coordDiff=coordRangeRadiusFar; showPois(); floatClose();'>"+l("far")+" (5 km)</div>";
  }
  
  mapOptHtml += "<br/>";
  
  if(document.getElementById('showMapOptBtn'))
  {
    var btn = document.getElementById('showMapOptBtn');
    var action = "float('custom', '"+l("title")+"', '', '"+objEncode(mapOptHtml)+"', '', '')";
    if(btn.attachEvent){
       btn.attachEvent("onclick", action);
    } else {
       btn.setAttribute("onclick", action);
    }
  }

  if(document.getElementById('mapOptBtn'))
  {
    var btn = document.getElementById('mapOptBtn');
    var action = "showMapInRoute('"+objEncode(poisToShow)+"', false, true)";
    if(btn.attachEvent){
       btn.attachEvent("onclick", action);
    } else {
       btn.setAttribute("onclick", action);
    }
  }
  
  stopLoading();
  
  logging('Ending showPois Function...');
  setHistoryLastFnc("showPois()");
} 

function showPoi(RoutesIndex, poiIndex)
{
  if(mapRefresher != null)
    window.clearInterval(mapRefresher);
  //mapRefresher = window.setInterval("showPoi("+RoutesIndex+", "+poiIndex+")", mapRefreshTimeout);
  
  logging('Starting showPoi Function...');
  
  document.getElementById('mapdiv').style.display = "none";
  document.getElementById('content').style.display = "block";
  
  var localRoutes = localStore("local_routes");
  var route = localRoutes[RoutesIndex];
  var pois = route.route.points_of_interest.point_of_interest;
  var poi = pois[poiIndex];
  
  
  var htmlContent = "";
  /*
  if(backFunction)
    htmlContent += "<div class='button' onclick='"+backFunction+"' >Back</div>";
  */

  htmlContent += "<div id='mapOptBtn' class='mapOff'></div>";
  var poisToShow = Array();
  
  poisToShow.push(poi);
  showMapInRoute(objEncode(poisToShow), true, true);
  document.getElementById('mapdiv').style.display = 'block';

  if(localStore("show_images") && poi.elements && isArray(poi.elements.info_element) && poi.elements.info_element.length > 0)
  {
    htmlContent += "<div style='display: inline-block;'>";
    for(var i=0; i<poi.elements.info_element.length; i++){
      htmlContent += "<a href='"+poi.elements.info_element[i].path+"'>";
      htmlContent += "<img id='"+poi.elements.info_element[i].name+"' style='margin-left: 15px; margin-bottom: 3px; display: none; height: 50px; float: left;' src='"+poi.elements.info_element[i].path+"'/></a>";
      displayPics(poi.elements.info_element[i].name);
    }
    htmlContent += "</div>";
  }
  
  htmlContent += "<h3>"+poi.name+"</h3>";
  if(poi.description && poi.description != "")
    htmlContent += "<div>"+poi.description+"</div>";
  
  document.getElementById('content').innerHTML = htmlContent;
  //document.getElementById('content').innerHTML += JSON.stringify(poi);  

  if(document.getElementById('mapOptBtn'))
  {
    var btn = document.getElementById('mapOptBtn');
    var action = "showMapInRoute('"+objEncode(poisToShow)+"', false, true)";
    if(btn.attachEvent){
       btn.attachEvent("onclick", action);
    } else {
       btn.setAttribute("onclick", action);
    }
  }

  logging('Ending showPoi Function...');
  setHistoryLastFnc("showPoi("+RoutesIndex+", "+poiIndex+")");
}
 
  
function displayPics(poiId)
{
  logging('Starting displayPics Function...');
  //check for internet connection
  $fh.web({
    url: 'http://www.google.com',
    method: 'GET'
  }, function(res){
    if(res.status == 200)
      document.getElementById(poiId).style.display='block';
  });
  logging('Ending displayPics Function...');
}

function showMapInRoute(pois, offline, notShowIniEndIcons)
{
  logging('Starting showMapInRoute Function...');
  pois = objDecode(pois);
  
  if(offline)
    pois = getInMapPois(pois);
  
  //check for points of interest
  if(pois && isArray(pois))
  {//check witch map to show(online, offline)
    if(offline)
    {
      //clear any icon from the map
      document.getElementById('mapdiv').innerHTML = "";
      //get users current position
      var lastPos = localStore("last_position");
      
      /* Get a Minimum and Maximum (Latitude and Longitude) to
       * establish an optimized zoom to the Map
       */
      var poisAndLocation = Array();
      //get min and max latitude and longitude from the points of interest
      for(var i=0; i<pois.length; i++)
        poisAndLocation.push({x: pois[i].location.location_x, y: pois[i].location.location_y});
      //include the user's current position if available
      if(lastPos && !isNaN(lastPos.lat) && !isNaN(lastPos.log))
        poisAndLocation.push({x: lastPos.lat, y: lastPos.log});
      //call the function getMinMaxLatLog to calculate max's and min's
      var minMaxLatLog = getMinMaxLatLog(poisAndLocation);
      

      //convert the min and max lat and log to % values
      var zoomLat = ((mapRef.maxLat - mapRef.minLat)*100)/(minMaxLatLog.poiMaxLat - minMaxLatLog.poiMinLat);
      if(zoomLat < 0)
        zoomLat = -zoomLat;
      var zoomLog = ((mapRef.maxLog - mapRef.minLog)*100)/(minMaxLatLog.poiMaxLog - minMaxLatLog.poiMinLog);
      if(zoomLog < 0)
        zoomLog = -zoomLog;
      if ( zoomLat < zoomLog) 
        zoom = (zoomLat/1.2);
      else
        zoom = (zoomLog/1.2);
        
      if(zoom > mapRef.maxZoom)
        zoom = mapRef.maxZoom;
      
      var midPointX = (minMaxLatLog.poiMaxLog + minMaxLatLog.poiMinLog)/2;
      var midPointY = (minMaxLatLog.poiMaxLat + minMaxLatLog.poiMinLat)/2;
      
      minMaxLatLog.poiMaxLog = midPointX + (mapRef.maxLog - mapRef.minLog)*100/(zoom*2);
      minMaxLatLog.poiMinLog = midPointX - (mapRef.maxLog - mapRef.minLog)*100/(zoom*2);
      minMaxLatLog.poiMaxLat = midPointY + (mapRef.maxLat - mapRef.minLat)*100/(zoom*2);
      minMaxLatLog.poiMinLat = midPointY - (mapRef.maxLat - mapRef.minLat)*100/(zoom*2);
      
      
      var posX = ((minMaxLatLog.poiMinLog - mapRef.minLog)/(mapRef.maxLog-mapRef.minLog));
      var posY = ((minMaxLatLog.poiMaxLat - mapRef.maxLat)/(mapRef.minLat-mapRef.maxLat));
      
      posX = 0 - (posX * (mapRef.divWidth*zoom/100));
      posY = 0 - (posY * (mapRef.divHeight*zoom/100));
      
      
      document.getElementById('mapdiv').style.backgroundSize = zoom + "%";
      document.getElementById('mapdiv').style.backgroundPosition = posX + "px " + posY + "px";
      
      //loop thru points of interest
      for(var i=0; i<pois.length; i++)
      {
        var poi = pois[i];
        //define icons
        var mapIcon = "";
        if(notShowIniEndIcons)
          mapIcon = "gray";
        else{
          if(i==0)
            mapIcon = "green";
          else if(i==pois.length-1)
            mapIcon = "red";
          else
            mapIcon = "gray";
        }
        
        mapIcon += (i+1)<10 ? "0"+(i+1) : (i+1);
        
        putIconInStaticMap(poi.location.location_x, poi.location.location_y, mapIcon + ".png", minMaxLatLog);
      }
      
      //check if we have the current position of the user
      if(lastPos && !isNaN(lastPos.lat) && !isNaN(lastPos.log))
        putIconInStaticMap(lastPos.lat, lastPos.log, "blue_dot_circle.png", minMaxLatLog);
      
      //document.getElementById('mapdiv').style.backgroundSize = '100%';  
    }
    else
    {//online google maps Map
      var x = pois[0].location.location_x;
      var y = pois[0].location.location_y;
      document.getElementById('mapdiv').innerHTML = '';
      $fh.map({
        target: 'mapdiv',
        lat: x,
        lon: y,
        zoom: 12
      }, function (res){
        map = res.map;
        
        if(pois.length > 0)
          setMarkers(map, pois, notShowIniEndIcons);
        
        var lastPos = localStore("last_position");
        
        if(lastPos && !isNaN(lastPos.lat) && !isNaN(lastPos.log))
        {
          var posToMap = new google.maps.LatLng(lastPos.lat, lastPos.log);
          var marker = new google.maps.Marker({
            position: posToMap,
            map: map,
            icon: new google.maps.MarkerImage("css/icons/blue_dot_circle.png")
          });
          
          pois.push({
            location: {
              location_name: "",
              location_x: lastPos.lat,
              location_y: lastPos.log,
              location_z: 0
            }
          });
        }
        
        if(pois.length > 1)
        {
          var bounds = autoZoom(pois);
          map.fitBounds(bounds);
        }
        
      });
    }
    
    //change the showMapBtn
    
    if(document.getElementById('mapOptBtn'))
    {
      var btn = document.getElementById('mapOptBtn');
      if(!offline)
        var poisToMap = getInMapPois(pois);
      else
        var poisToMap = pois;
        
      var action = "showMapInRoute('"+objEncode(pois)+"', "+(!offline)+", "+notShowIniEndIcons+")";
      if(btn.attachEvent){
         btn.attachEvent("onclick", action);
      } else {
         btn.setAttribute("onclick", action);
      }
    
      if(offline)
        btn.style.backgroundImage = 'url(css/icons/linkOff.png)';
      else
        btn.style.backgroundImage = 'url(css/icons/link.png)';
    }
    
  }
  
  logging('Ending showMapInRoute Function...');
}

function putIconInStaticMap(lat, log, icon, minMaxLatLog)
{
  logging('Starting putIconInStaticMap Function...');
  //check if current position is inside the static map
  if(lat <= minMaxLatLog.poiMaxLat && lat >= minMaxLatLog.poiMinLat)
  {
    if(log <= minMaxLatLog.poiMaxLog && log >= minMaxLatLog.poiMinLog)
    {
      //put the current positon icon on the map
      document.getElementById('mapdiv').innerHTML += "<img id='icon_"+JSON.stringify(lat+log)+"' src='css/icons/"+icon+"' />";
      
      //calculate the position to draw using the map image as reference
      //3 simple tecnique
      
      //var top  = (0-(lat - minMaxLatLog.poiMaxLat)*mapRef.divHeight)/(minMaxLatLog.poiMaxLat-minMaxLatLog.poiMinLat);
      //var left = ((log - minMaxLatLog.poiMinLog)*mapRef.divWidth)/(minMaxLatLog.poiMaxLog-minMaxLatLog.poiMinLog);
      var top  = (0-(lat - minMaxLatLog.poiMaxLat)*mapRef.divHeight)/(minMaxLatLog.poiMaxLat-minMaxLatLog.poiMinLat);
      var left = ((log - minMaxLatLog.poiMinLog)*mapRef.divWidth)/(minMaxLatLog.poiMaxLog-minMaxLatLog.poiMinLog);
            
      //calculate using the size of the div
      /*
      top  = (mapRef.divHeight*top)/mapRef.mapHeight;
      left = (mapRef.divWidth*top)/mapRef.mapWidth;
      */
      
      //pixel equivalence tecnique
      /*
      var top  = (mapRef.maxLat-lat)/((mapRef.maxLat-mapRef.minLat)/mapRef.mapHeight);
      var left = (mapRef.maxLog-log)/((mapRef.maxLog-mapRef.minLog)/mapRef.mapWidth);
      */
      //subtract the icon height
      var currPosIcon = document.getElementById('icon_'+JSON.stringify(lat+log));
      //top -= currPosIcon.style.height;
      top -= 27;
      left -= 27/2;
      currPosIcon.style.marginLeft = left + "px";
      currPosIcon.style.marginTop  = top + "px";
      currPosIcon.style.position = "absolute";
      
    }
  } 
  logging('Ending putIconInStaticMap Function...');
}

function manageYourRoutes()
{
  logging('Starting manageYourRoutes Function...');

  document.getElementById('mapdiv').style.display = "none";
  document.getElementById('content').style.display = "block";
  
  //check if user is reg in the app
  if(!userData){
    var msg = 'To create, manage or delete routes you have to fill your Rotas user account first!';
    float("", l("title"), msg, "", "", "");
    showSettings();
  }else{  
    var htmlContent = "<h3>New Route</h3><br>";
    htmlContent += "Name:&nbsp;<input id='name' name='name' type='text' >";
    htmlContent += "<div class='exitBtn' style='display: inline-block;' id='newRoute' onclick='newRoute()' >"+l("newRoute")+"</div>";
    
    htmlContent += "<br><h3>My Routes</h3><br>";
    var user_routes = localStore("user_routes");
    if(isArray(user_routes) && user_routes.length > 0)
    {
      for(var i=0; i<user_routes.length; i++)
      {
        htmlContent += "<button onclick='delRoute(\""+user_routes[i].id+"\")'>X</button><button onclick='"+"editRoute(\""+user_routes[i].id+"\")"+"'>Edit</button> " + user_routes[i].title + "<br/>";
      }
    }
    else
    {
      htmlContent += "No routes to show...";
    }
    
    document.getElementById('content').innerHTML = htmlContent;
  }

  logging('Ending manageYourRoutes Function...');
}

function delRoute(routeID)
{
  if(flaggedRoute && routeID == flaggedRoute.id)
    unflagRoute();
  
  var user_routes = localStore("user_routes");
  var route = getUserRoute(routeID);
  user_routes.remove(route);
  localStore("user_routes", "save", user_routes, ["manageYourRoutes()"], ["float('', '"+l("title")+"', 'Something went wrong while saving your new Route!', '', '', '');)"]);
}

function newPoi()
{
    document.getElementById('newPoiForm').style.display = 'block';
}

function getUserRoute(id){
  var user_routes = localStore("user_routes");
  for(var i=0; i<user_routes.length; i++){
    if(user_routes[i].id === id){
      return user_routes[i];
    }  
  }
}

function editRoute(routeID, newPoi)
{
  //get route
  var user_routes = localStore("user_routes");
  var route = getUserRoute(routeID);
  flaggedRoute = route;
  
  document.getElementById('mapdiv').style.display = "none";
  document.getElementById('content').style.display = "block";
  
  var htmlContent = "<h3>Edit Route</h3><br>";
  htmlContent += "Name:&nbsp;<input id='name' name='name' type='text' value='"+route.title+"' >";
  
  htmlContent += "<br><h3>Points of Interest</h3>";
  htmlContent += "<div class='exitBtn' style='display: inline-block;' id='newPoi' onclick='newPoi()' >"+l("newPoi")+"</div>";
  
  var newPoiForm = "<h3>New Poi</h3><br>Name:&nbsp;<input id='poi_name' name='poi_name' type='text' >";
  //newPoiForm += "<br><div id='newPoiImgs' class='newPoiImgs'></div>";
  //newPoiForm += "<div class='exitBtn' style='margin-top: 5px; height: 40px; padding-top: 30px;' id='addPoi' onclick='startLoading(); addPic(\""+routeID+"\");' >"+l("addPic")+"</div>";
  newPoiForm += "<div class='exitBtn' style='position: relative; bottom: -12px;' onclick='savePoi(\""+routeID+"\")'>"+l("save")+"</div>";
  
  var newPoiDisplay = newPoi ? "block" : "none";
  
  htmlContent += "<div id='newPoiForm' class='newPoiForm' style='display: "+newPoiDisplay+";' >"+newPoiForm+"</div>";
  
  htmlContent += "<div id='pois'>";
  if(route.route.points_of_interest.point_of_interest.length > 0)
  {
    for(var i=0; i<route.route.points_of_interest.point_of_interest.length; i++)
    {
      var poi = route.route.points_of_interest.point_of_interest[i];
      var poiForm = "<h3>"+poi.name+"</h3>";
      poiForm += "<br><div id='imgs_"+poi.id+"' class='newPoiImgs'>";
      for(var k=0; k<poi.elements.info_element.length; k++)
      {
        //var img = "data:image/jpeg;base64," + poi.elements.info_element[k].b64;
        var img = poi.elements.info_element[k].path;
        poiForm += "<img src='"+img+"' />";
      }
      poiForm += "</div>";
      poiForm += "<div class='exitBtn' style='margin-top: 5px; height: 40px; padding-top: 30px;' id='addPoi' onclick='startLoading(); addPic(\""+routeID+"\", \""+poi.id+"\");' >"+l("addPic")+"</div>";
      poiForm += "<div style='width: 93%;'>";
      if(poi.location && poi.location.location_x)
        poiForm += "<br>Lat: " + poi.location.location_x;
      if(poi.location && poi.location.location_y)
        poiForm += "<br>Long: " + poi.location.location_y;
      poiForm += "</div>";
      
      //poiForm += "<div class='exitBtn' style='display: inline-block;' onclick='savePoi("+JSON.stringify(route)+")'>"+l("save")+"</div>";
      htmlContent += "<div id='newPoiForm' class='newPoiForm' style='height: 180px;'>"+poiForm+"</div>";
    }
  }else
    htmlContent += "No pois to show!";
  htmlContent += "</div>";
  
  htmlContent += "<div class='exitBtn' style='display: inline-block;' id='closeRoute' onclick='unflagRoute()' >"+l("closeRoute")+"</div>";
  
  document.getElementById('content').innerHTML = htmlContent;
}

function savePoi(routeID)
{
  var route = getUserRoute(routeID);
  
  var name = document.getElementById('poi_name').value;
  //var imgs = document.getElementById('newPoiImgs').childNodes;
  
  var timestamp = new Date().getTime();
  var data = makeWSdate();
  var id = timestamp + "_" + name;
  
  var lasPos = localStore("last_position");
  
  //(id, elements, location, name, order)
  var poi = new POI({
    id : id,
    name : name,
    location : new Location({
                      lat: lasPos.lat,
                      lon: lasPos.log,
                      alt: 0
                    }),
    elements : Array(),
    order: 0
  });
  
  route.route.points_of_interest.point_of_interest.push(poi);
  
  //TESTING CODE
  var local_routes = localStore("local_routes");
  if(!local_routes)
    local_routes = Array();
  for(var i=0; i<local_routes.length; i++){
    if(local_routes[i].id === route.id)
      local_routes[i] = route;
  }
  localStore("local_routes", "save", local_routes);
  //TESTING CODE
  
  var user_routes = localStore("user_routes");
  for(var i=0; i<user_routes.length; i++){
    if(user_routes[i].id === route.id)
      user_routes[i] = route;
  }
  localStore("user_routes", "save", user_routes, ["editRoute('"+route.id+"')"], ["float('', '"+l("title")+"', 'Something went wrong while saving your new Route!', '', '', '');)"]);
  
}

function addPic(routeID, poiID)
{
  $fh.cam({
    act: "picture",
    source: "camera",
    uri : true
    /*type : false*/
  }, function(res){
    stopLoading();
    
    document.getElementById('img_'+poiID).innerHTML += "<img src='"+res.uri+"'>";
    
    window.resolveLocalFileSystemURI(res.uri,
    function(file)
    {
      var reader = new FileReader();
      reader.onloadend = function(evt) 
      {
        var route = getUserRoute(routeID);
        
        var poiEle = null;
        for(var j=0; j<route.route.points_of_interest.point_of_interest.length; j++)
        {
          if(route.route.points_of_interest.point_of_interest[j].id === poiID)
          {
            var img = Base64.encode(evt.target.result);
            
            $fh.web(
            {
              url: uriSpaces('http://rotas.inmadeira.com/rotas/base64Response.php'),
              method: 'GET',
              charset: 'UTF-8',
              contentType: 'text/plain',
              params: [
                {name:'b64', value: img}
              ],
              period: 10000
            }, function (res)
            {
              console.log("pic sent to server!");
            });
            
            route.route.points_of_interest.point_of_interest[j].elements.info_element.push(new Element({owner: "", imgType: "", imgSrc: res.uri, b64: img}));
            
            var user_routesEle = localStore("user_routes");
            for(var k=0; k<user_routesEle.length; k++)
            {
              if(user_routesEle[k].id === route.id)
                user_routesEle[k] = route;
            }
            localStore("user_routes", "save", user_routesEle);
          }
        }      
      };
      reader.readAsDataURL(file);
    },
    fail);
    
  }, function(msg, err){
    stopLoading();
    alert('Camera Error while add picture to a Point of Interest!');
  });
}

function unflagRoute()
{
  flaggedRoute = null;
  manageYourRoutes();
}

function newRoute()
{
  logging('Starting newRoute Function...');

  if(document.getElementById('name').value != "")
  {
    //register on file
    var user_routes = localStore("user_routes");
    if(!user_routes)
      user_routes = Array();
    
    var timestamp = new Date().getTime();
    var data = makeWSdate();
    
    var id = timestamp + "_" + document.getElementById('name').value;
    
    var route = new Route({
      id : id,
      title: document.getElementById('name').value,
      owner: "",
      pois : Array(),
      date: data
    });
    
    //TESTING CODE
    var local_routes = localStore("local_routes");
    if(!local_routes)
      local_routes = Array();    
    local_routes.push(route);
    localStore("local_routes", "save", local_routes);
    //TESTING CODE
    
    user_routes.push(route);
    flaggedRoute = route;
    localStore("user_routes", "save", user_routes, ["editRoute('"+route.id+"')"], ["float('', '"+l("title")+"', 'Something went wrong while saving your new Route!', '', '', '');)"]);
  }
  else
  {
    document.getElementById('name').focus();
    float("", l("title"), 'To create a new Route write a name for it!', "", "", "");
  }

  logging('Ending newRoute Function...');
}

function showSettings()
{
  if(mapRefresher != null)
    window.clearInterval(mapRefresher);
    
  logging('Starting showSettings Function...');

  highlightMenu("showSettingsBtn");

  document.getElementById('mapdiv').style.display = "none";
  document.getElementById('content').style.display = "block";
  
  var htmlContent = "<h3>"+l("download")+"</h3><br>";
  htmlContent += "<div>"+l("connectivityWarning")+"</div><br/>";
  htmlContent += "<div class='button' onclick='addRoutes()' style='margin-right: 5px;'>"+l("addRoutesLocalStorage")+"</div>";
  
  htmlContent += "<br><hr style='display: inline-block; width: 100%;'><h3>"+l("accountDetailsTitle")+"</h3>";
  
  if(userData){
    htmlContent += "<br>email: " + userData.email;
    htmlContent += "<br><button onclick='deleteUserData()'>"+l("delAccountSettings")+"</button>";
  }else{
    htmlContent += "<br/>"+l("fillAccountInfo")+"<br/>";
    htmlContent += "email:<br/><input id='email' name='email' type='text'/><br/>";
    htmlContent += "password:<br/><input id='pass' name='pass' type='password'/></br>";
    htmlContent += "<button onclick='saveUserData()'>"+l("save")+"</button>";
  }
  
  htmlContent += "<br><hr><h3>"+l("appSettingsTitle")+"</h3>";
  htmlContent += "<div class='exitBtn' id='exitBtn' onclick='exit()' >"+l("exit")+"</div>";
  htmlContent += "<br><input type='checkbox' "+(localStore("show_images")?'checked':'')+" onchange='showImages(this)'/>"+l("showImgs");
  htmlContent += " - "+l("showImgsWarning");
  htmlContent += "<br><br>";
  htmlContent += "<select id='lang' name='lang' onchange='selectLang(this)'><option "+(localStore("language")==2?"selected":"")+" value='2'>"+l("EN")+"</option><option "+(localStore("language")==1?"selected":"")+" value='1'>"+l("PT")+"</option></select>";
  htmlContent += " "+l("setLangLabelInfo");
  
  htmlContent += "<hr>";
  var lastPos = localStore("last_position");
  htmlContent += "<b>Lat:</b>&nbsp;&nbsp;"+lastPos.lat+"<br>";
  htmlContent += "<b>Lon:</b>&nbsp;"+lastPos.log+"<br>";
  htmlContent += "<b>Alt:</b>&nbsp;&nbsp;"+lastPos.alt+"<br>";
  htmlContent += "<b>@:</b>&nbsp;&nbsp;&nbsp;"+lastPos.when+"<br>";

  document.getElementById('mapdiv').style.display = "none";
  document.getElementById('content').innerHTML = htmlContent;

  logging('Ending showSettings Function...');
  setHistoryLastFnc("showSettings()");
}
  
function selectLang(lang)
{
  localStore("language", "save", lang.value);
}

function showImages(obj)
{
  logging('Starting showImages Function...');
  if(obj.checked){  
    localStore("show_images", "save", 1);
  }else{
    localStore("show_images", "save", 0);
  }
  logging('Ending showImages Function...');
}

function saveUserData()
{
  logging('Starting saveUserData Function...');

  var email = document.getElementById('email');
  var pass = document.getElementById('pass');
  
  var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  
  if(filter.test(email.value) && pass.value.length > 3)
  {
    var password = MD5(pass.value);
    var dataToSave = {email:email.value, pass:password};
    localStore("user_data", "save", dataToSave, ["loadUserData()", "showSettings()"]);
    
    loadUserData();
    
  }
  else
  {
    pass.value = "";
    email.focus();
    float("", l("title"), l("userDataFormErr"), "", "", "");
  }
  logging('Ending saveUserData Function...');
}

function loadUserData()
{
  userData = localStore("user_data");
  if(checkNetworkState() && userData.email && userData.pass)
  {
    startLoading();
    $fh.web(
    {
      url: uriSpaces(localStore("xdms_url") + '/user/login/'),
      method: 'GET',
      charset: 'UTF-8',
      contentType: 'text/xml',
      params: [
        {name:'username', value:userData.email},
        {name:'password', value:userData.pass}
      ],
      period: 10000
    }, function (res)
    {
      if(res.status != 200)
      {
        stopLoading();
        //float("", l("title"), l("getRouteFromWebErr"), "", "", "");
        //showSettings();
      }
      else
      {
        stopLoading();
        var xml = "";
        for(var i=2; i<res.body.split(">").length-1; i++){
          if(i>2){ xml += ">"};
            xml += res.body.split(">")[i];
        }
        var res = xml2json.parser(xml);
        if(res && res != "" && res != "invalid user")
          localStore("sessionID", "save", xml2json.parser(xml));
        else
          localStore("sessionID", "save", globalSession);
      }
    });
  }
}

function deleteUserData()
{
  logging('Starting deleteUserData Function...');
  localStore("user_data", "del", null, ["userData = null","showSettings()"], ["float('', '"+l("title")+"', 'Failed to remove user account data!', '', '', '');"]);
  logging('Ending deleteUserData Function...');
}

function addRoutes()
{
  logging('Starting addRoutes Function...');
  
  if(!checkNetworkState()){
      float("", l("title"), l("webCheck"), "", "", "");
  }
  
  if(checkNetworkState())
  {
    startLoading();
    
    //document.getElementById('content').innerHTML = "<center><img src='css/loading.gif'></center>";
  
    $fh.web(
    {
      url: uriSpaces(localStore("xdms_url") + '/itineraries/list/0'),
      method: 'GET',
      charset: 'UTF-8',
      contentType: 'text/xml',
      params: [
        {name:'informationLevel', value:'1'},
        {name:'visibility', value:'3'},
        {name:'langId', value:localStore("language")},
        {name:'sessionid', value: localStore("sessionID") },
      ],
      period: 10000
    }, function (res)
    {
      if(res.status != 200)
      {
        stopLoading();
        float("", l("title"), l("getRouteFromWebErr"), "", "", "");
        showDownload();
      }
      else
      {
        var xml = "";
        for(var i=2; i<res.body.split(">").length-1; i++){
          if(i>2){ xml += ">"};
          xml += res.body.split(">")[i];
        }
        
        if(xml2json.parser(xml).itineraries.itinerary)
        {
          var webRoutes = xml2json.parser(xml).itineraries.itinerary;
          var htmlContent = "<h3>"+l("availRoutesList")+"</h3><hr>";
          var localRoutes = localStore("local_routes");
          
          for(var i=0; i<webRoutes.length; i++)
          {
            var route = webRoutes[i];
            var routeLocally = false;
            //check if route is already included locally
            if(isArray(localRoutes) && localRoutes.length > 0){
              for(var j=0; j<localRoutes.length; j++){
                if(localRoutes[j].id == route.id){
                  routeLocally = true;
                  break;
                }
              }
            }
            
            if(!routeLocally && typeof(route.title) == "string")
            {
              htmlContent += "<div id='"+route.id+"' class='simpleListItem' ";
              htmlContent += "onclick='addWebRouteToLocalRoutes("+JSON.stringify(route)+");' >" + route.title + "</div>";
            }
          }
            
          document.getElementById('content').innerHTML = htmlContent;
          //return localRoutes;
          stopLoading();
        }
      }
    });
  }
  
  logging('Ending addRoutes Function...');
  setHistoryLastFnc("addRoutes()");
}
  
     
function addWebRouteToLocalRoutes(route)
{
  startLoading();
  logging('Starting addWebRouteToLocalRoutes Function...');
  var routeHtml = document.getElementById(route.id).innerHTML;
  //document.getElementById(route.id).innerHTML = "<center><img src='css/loading.gif'></center>"; //"Retrieving route information...";
    
  $fh.web( { 
    url: uriSpaces(localStore("xdms_url") + '/itineraries/show/'+route.id),
    method: 'GET',
    charset: 'UTF-8',
    contentType: 'text/xml',
    params: [
      {name:'informationLevel', value:'12'},
      {name:'langId', value:localStore("language")},
      {name:'sessionid', value: localStore("sessionID") },
    ],
    period: 360000
  }, function (res) 
  {
    var error = false;

    if(res.status == 200 && res.body && res.body != "")
    {
      var xml = "";
      for(var i=2; i<res.body.split(">").length-1; i++){
        if(i>2){ xml += ">"};
        xml += res.body.split(">")[i];
      }
        
      if(xml2json.parser(xml))
      {
        var webRoute = xml2json.parser(xml);
        
        if(webRoute.route)
        {
          
          var pois = webRoute.route.points_of_interest.point_of_interest;   
          /*
          for(var i=0; i < pois.length; i++){
            var poi = pois[i];
            if(poi.elements.info_element)
            {
              var mediaElements = poi.elements.info_element;
              if(mediaElements.length > 0)
                getImage(poi.id, mediaElements[0]);
              for(var j=0; j<mediaElements.length; j++)
                getImage(poi.id, mediaElements[j]);   
            }
          }*/
          
          var localRoutes = localStore("local_routes");
          
          if(!localRoutes)
            localRoutes = Array();
          localRoutes.push(webRoute);
          
          pois = webRoute.route.points_of_interest.point_of_interest;
          
          var msg = l("routeIncludedSuccess");//"Route included successfuly in your local routes list!";
          stopLoading();
          localStore("local_routes", "save", localRoutes, ["document.getElementById('"+route.id+"').innerHTML = '"+msg+"';"], ["float('', '"+l("title")+"', '"+l("addRouteErr")+"', '', '', ');"]);
        }else
          error = true;
      }else
        error = true;
    }else
      error = true;

    if(error){
      float("", l("title"), l("addRouteErr"), "", "", "");
      document.getElementById(route.id).innerHTML = routeHtml;
    }
  });
  logging('Ending addWebRouteToLocalRoutes Function...');
}


  

function getImage(poiId, mediaElement)
{ 
  $fh.web( {
    url: 'http://rotas.inmadeira.com/rotas/base64Response.php',
    params:[{name:'uri',value: uriSpaces(mediaElement.path)}],
    method: 'GET',
  }, function (res)
  {
    if(res.status == 200 && res.body && res.body != "")
    {
      root.getDirectory("rotas/img/" + poiId, {create: true},
      function(dir)
      {
        workingDir = dir;
        workingDir.getFile(poiId + "_" + mediaElement.id + "_" + mediaElement.name, {create: true, exclusive: true}, 
        function(file)
        {
          var bytes = JSON.parse(res.body);
          
          var str = '';
          for(var i=0; i<bytes.length/1000; i++) {
              str += String.fromCharCode.apply(null, bytes.slice(i*1000, i*1000 + 1000));            
          }
          
          file.createWriter(
            function(writer)
            {
              str = Base64._utf8_decode(str);
              
              //str = escape(str);
              //str = unescape(str);
              /*
              var re = new RegExp(/[\xC2-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF4][\x80-\xBF]{3}/g);
              str.replace(re, '');
              */
              
              writer.write(str);
            },
            fail);
        },
        fail);
      },
      fail);
    }
    else{
      //alert(JSON.stringify(res.errors));
    }
  });
  
  //var iniTime = new Date().getTime() + 2000;
  //while(!localStore("mediaContentTMP") && iniTime > new Date().getTime())
  //{}
  //mediaElement.mediaContent = localStore("mediaContentTMP");
  
}

function removeLocalRoute(index)
{
  logging('Starting removeLocalRoute Function...');
  
  float("confirm", l("title"), l("remRouteQuest"), "", "remLocalRouteAction("+index+")", "");
  
  /*
  if(confirm(l("remRouteQuest")))
  {
    var localRoutes = localStore("local_routes");
    //remove route from array
    localRoutes.splice(index,1);
    //update routes file
    localStore("local_routes", "save", localRoutes, ["showRoutes()"], ["alert('"+l("remRouteErr")+"')"]);
  }*/

  logging('Ending removeLocalRoute Function...');
}
  
function remLocalRouteAction(index)
{
  logging('Starting removeLocalRoute Function...');
  var localRoutes = localStore("local_routes");
  //remove route from array
  localRoutes.splice(index,1);
  //update routes file
  localStore("local_routes", "save", localRoutes, ["showRoutes()"], ["float('', '"+l("title")+"', '"+l("remRouteErr")+"', '', '', '')"]);  
  logging('Ending remLocalRouteAction Function...');
}
logging('End of App.JS file');
