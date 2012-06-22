logging('Start of init.js file');

$fh.ready(function()
{
  try{
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
    function(fileSystem)
    { // success get file system
      root = fileSystem.root;
    });
  }catch(ex){}
     
  startApp();
});

function startApp()
{
  logging('$fh.ready started');
  
  logging('Loading Language...');
  //load Language settings
  
  if(!localStore("language"))
    localStore("language", "save", 2);
  logging('Language Loaded.');
  
  //temporarlly
  /*
  localStore("media_content", "del");
  */
  
  logging('Deleting local vars');
  
  //clear significant local vars
  localStore('log', 'del');
  localStore('history', 'del');
  localStore('clientScrSz', 'del');
  
  //clear last position
  //localStore("last_position", "del");
  
  logging('Local vars Deleted');
  
  logging('Detecting client width and height');
  
  //detect client width and height and apply the min sizes to the body
  var clientW = document.documentElement.clientWidth;
  var clientH = document.documentElement.clientHeight;
  
  var dataToSave = {clientW: clientW, clientH: clientH};
  localStore("clientScrSz", "save", dataToSave);
  
  logging('Appling client height to the application body');
  document.body.style.minWidth = clientW + "px";
  document.body.style.minHeight = clientH + "px";
  logging('Finishing appling client height to the application body');
  
  /*
  var dataToSave = {lat:32.65938955, log:-16.9259391, alt:0, when:0};
  localStore("last_position", "save", dataToSave);
  */
  

  logging('Starting GPS reading from device...');
  //get GPS location
  var firstTimeGps = true;
  $fh.geo( {interval:5000}, function(res)
  {
    var dataToSave = {lat:res.lat, log:res.lon, alt:res.alt, when:res.when};
    
    if(firstTimeGps)
    {
       lastPos = localStore("last_position");
       if(lastPos && (dataToSave.lat == lastPos.lat || dataToSave.log == lastPos.log)){
         firstTimeGps = false;
         float("", l("title"), l("noGPS"), "", "", "");
       }
    }
    
    localStore("last_position", "save", dataToSave);
    
  }, function(geoCodeError){
    //document.getElementById('content').innerHTML += "Error retrieving GPS coordinates, " + geoCodeError;
    /*if(firstTimeGps)
    {
      firstTimeGps = false;
      float("", l("title"), l("noGPS"), "", "", "");
    }*/
  } );
  
  //register hardware button back
  $fh.handlers({type:'back'}, function()
  {
    var resLastFnc = getHistoryLastFnc();
    if(resLastFnc){
      eval(resLastFnc);
      return false;
    }else{
      return true;
    } 
  });
  
  logging('Loading User Data...');
  //tries to load User Information
  loadUserData();
  
  logging('Loading Menu...');
  //load menu
  loadMenu();
  
  logging('Showing Start Screen...');
  //starter screen
  showStartScreen();
  
  logging('End of $fh.ready');
}

/* Route Info Structure
 * info(id, owner, pois[arraylist poi], title)
 */
var Route = function(info)
{
  this.creation_date = makeWSdate();
  this.description = null;
  this.duration = "0001-01-01T12:00:00";
  this.edition = 3;
  this.elements = null;
  this.id = info.id;
  this.notes = null;
  this.owner_name = info.owner;
  this.related_attractions = null;
  this.route = {points_of_interest : {point_of_interest : info.pois}};
  this.title = info.title;
  this.user_favorite_count = 0;
}

/* POI Info Structure
 * info(id, elements, location, name, order)
 */
 
var POI = function(info)
{
  this.classifications = null;
  this.copyright = null;
  this.description = null;
  this.destinations = null;
  this.elements = {info_element : info.elements};
  this.external_system_item = null;
  this.id = info.id;
  this.location = info.location;
  this.name = info.name;
  this.order = info.order;
  this.origins = null;
  this.type = 1;
  this.user_favorite_count = 0;
  this.user_rating = 0;
  this.visibility = 0;
  this.xml_string = null;
}

/* Element Info Structure
 * info(owner, imgType, imgSrc)
 */
var Element = function(info)
{
  this.copyright = info.owner;
  this.description = null;
  this.id = null;
  this.name = null;
  this.path = info.imgSrc;
  this.subtype = info.imgType;
  this.type = 3;
  this.b64 = info.b64;
}

/* Location Info Structure
 * info(lat, lon, alt)
 */
var Location = function(info)
{
  this.location_name = null;
  this.location_x = info.lat;
  this.location_y = info.lon;
  this.location_z = info.alt;
}

logging('end of init.js file');
