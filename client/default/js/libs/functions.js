logging('Start of functions.js file');


/*
//check if internet connection is available
$fh.web({
  url: 'http://www.google.com',
  method: 'GET'
}, function(res){
  if(res.status == 200)
  {
    
  }
});*/

function isArray(o){
  if(o != null)
    return(typeof(o.length)=="undefined")?false:true;
  else
    return false;
}

Array.prototype.inArray = function (value){
  var i;
  for (i=0; i < this.length; i++) {
    // Matches identical (===), not just similar (==).
    if (JSON.stringify(this[i]) === JSON.stringify(value)){
      return true;
    }
  }
  return false;
};

Array.prototype.remove = function(obj) 
{
    for(var i = 0; i < this.length; ++i)
    {
        if(JSON.stringify(this[i]) === JSON.stringify(obj))
        {
            this.splice(i, 1);
            return;
        }
    }
}

/*
 * Replaces objects in an array, case already exists, 
 * case not pushes the object to the array.
 */
Array.prototype.replaceInArray = function (value){
  var i;
  if(this.length > 0){
    for (i=0; i < this.length; i++) {
      // Matches identical (===), not just similar (==).
      if (JSON.stringify(this[i]) === JSON.stringify(value))
        this[i] = value;
      else
        this.push(value);
    }
  }else
    this.push(value);
};

function zip(s){
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 512;
    for (var i=1; i<data.length; i++) {
        currChar=data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase=currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i=0; i<out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

function unzip(s){
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 512;
    var phrase;
    for (var i=1; i<data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        }
        else {
           phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
}

function objEncode(obj)
{
  if(obj)
    return Base64.encode(zip(JSON.stringify(obj)));
  else
    return false;
}
function objDecode(obj_str)
{
  if(obj_str)
    return JSON.parse(unzip(Base64.decode(obj_str)));
  else
    return false;
}


function uriSpaces(urlPath){
  if(typeof(urlPath) == "string")
    return urlPath.replace(/ /g,"%20_");
  else
    return urlPath;
}

/*
 * By Claudio Vieira
 * Improves and Simplifies the fh.data function from FeedHendry
 * Eg:
 * Save Data
 * localStore("user_routes", "save", user_routes, [array of actions to perform case success] , [array of actions to perform case failure]);
 * Delete Data
 * localStore("user_routes", "del", null, [array of actions to perform case success] , [array of actions to perform case failure]);
 * Read Data
 * localStore("user_routes", "load", null, [array of actions to perform case success] , [array of actions to perform case failure]);
 */    
function localStore(key, action, value, succFunctions, failFunctions)
{
  var returnValue = false;
  if(key && key != "")
  {
    switch(action)
    {
      default:
      case 'load':
        logging('LocalStore Function - Action Load with key - "' + key + '".');
        $fh.data( {
          "key": key
        }, function (res) {
          logging('LocalStore Function - Action Load Success');
          if(res && res.val)
            returnValue = JSON.parse(res.val);
        }, function (code) {
          logging('LocalStore Function - Action Load Failed');
          if(failFunctions && isArray(failFunctions))
          {
            for(var i=0; i<failFunctions.length; i++)
              eval(succFunctions[i]);
          }
        });
        logging('LocalStore Function - Action Load Finished');
      break;
      
      case 'save':
        logging('LocalStore Function - Action Save with key - "' + key + '".');
        $fh.data({
          "act": "save",
          "key": key,
          "val": JSON.stringify(value)
        }, function () {
          logging('LocalStore Function - Action Save Success');
          if(succFunctions && isArray(succFunctions))
            for(var i=0; i<succFunctions.length; i++)
              eval(succFunctions[i]);
        }, function (code) {
          logging('LocalStore Function - Action Save Failed');
          if(failFunctions && isArray(failFunctions))
            for(var i=0; i<failFunctions.length; i++)
              eval(failFunctions[i]);
        } );
        logging('LocalStore Function - Action Save Finished');
      break;
        
      case 'concact':
        var prevData = "";        
        $fh.data( {
          "key": key
        }, function (res) {
          if(res)
            prevData = res.val;
        });
  
        $fh.data({
          "act": "save", 
          "key": key, 
          "val": prevData+"<br>"+value
        }, function () {
          if(succFunctions && isArray(succFunctions))
            for(var i=0; i<succFunctions.length; i++)
              eval(succFunctions[i]);
        }, function (code) {
          if(failFunctions && isArray(failFunctions))
            for(var i=0; i<failFunctions.length; i++)
              eval(failFunctions[i]);
        } );
      break;
       
        
      case 'del':
        logging('LocalStore Function - Action Delete with key - "' + key + '".');
        // Remove
        $fh.data( {
          "act": "remove",
          "key": key
        }, function () {
          logging('LocalStore Function - Action Delete Success');
          if(succFunctions && isArray(succFunctions))
            for(var i=0; i<succFunctions.length; i++){
              eval(succFunctions[i]);
          }
        }, function (code) {
          logging('LocalStore Function - Action Delete Failed');
          if(failFunctions && isArray(failFunctions))
            for(var i=0; i<failFunctions.length; i++)
              eval(failFunctions[i]);
        });
        logging('LocalStore Function - Action Delete Finished');
      break;
    }
    if(returnValue)
        return returnValue;
    else
        return false;
  }else
    return false;
}

  
function setMarkers(map, locations, notShowIniEndIcons) 
{
  var i;
  for (i=0; i < locations.length; i++) 
  {
      var point = locations[i];
      var markLatLng = new google.maps.LatLng(point.location.location_x, point.location.location_y);
        
      var mapIcon = "";
      if(notShowIniEndIcons){
        mapIcon = "gray";
      }else{
        if(i==0)
          mapIcon = "green";
        else if(i==locations.length-1)
          mapIcon = "red";
        else
          mapIcon = "gray";
      }

      mapIcon += (i+1)<10 ? "0"+(i+1) : (i+1);
      var mrkImgIconUrl = 'http://google-maps-icons.googlecode.com/files/'+mapIcon+'.png';
      //var mrkImgIconUrl = 'css/icons/'+mapIcon+'.png';

      /*
      if(i==0)
          var mrkImgIconUrl = 'http://google-maps-icons.googlecode.com/files/green0'+(i+1)+'.png';
      else if(i < locations.length-1)
          var mrkImgIconUrl = 'http://google-maps-icons.googlecode.com/files/gray0'+(i+1)+'.png';
      else 
          var mrkImgIconUrl = 'http://google-maps-icons.googlecode.com/files/red0'+(i+1)+'.png';
      */
          
      var marker = new google.maps.Marker({
          position: markLatLng,
          map: map,
          title: point.location.title,
          icon: new google.maps.MarkerImage(mrkImgIconUrl)
      });
  }
}

  
/*
 * By Claudio Vieira
 * Calculates the Zoom and Center depending of geo-referenciating points
 */    
function autoZoom(points)
{
  var size = points.length;
  if(size > 0)
  {
      var medX = 0, medY = 0, maxX = 0, minX = 0, maxY = 0, minY = 0;

    //alert(points.length);
    /*
      var local = localStore("last_position");
      if(local && !isNaN(local.lat) && !isNaN(local.log))
        points.push({location: [{location_x: local.lat}, {location_y: local.log}]})
      */
      //alert(points.length);
          
      for (i=0; i < points.length; i++)
      {
          // Calculte Averages
          var x = parseFloat(points[i].location.location_x);
          var y = parseFloat(points[i].location.location_y);
          medX += x;
          medY += y;

          // Calculate Max and Min's
          if(maxX == 0){ maxX = x; }
          else if(maxX < x){ maxX = x; }

          if(minX == 0){ minX = x; }
          else if(minX > x){ minX = x; }

          if(maxY == 0){ maxY = y; }
          else if(maxY < y){ maxY = y; }

          if(minY == 0){ minY = y; }
          else if(minY > y){ minY = y; }
      }

      //Calculate normal average coordenates for both Latitude and Logitude
      medX = medX/points.length;
      medY = medY/points.length;
      //set a bunch of vars to help calculate the center mass of the points
      var weightX = 0, weightY = 0, x = 0, y = 0;
      //set a array to hold the list of calculated points
      var PointsWeight = Array();
      //For each Point, calculate a mass(Weight) based of max and mins
      //depending on the distance of the normal average point concentration
      for (i=0; i < points.length; i++)
      {
          x = parseFloat(points[i][1]);
          y = parseFloat(points[i][2]);
          //calculate the mass(Weight) that each point is going to have on the equation
          weightX = ((x*2)-medX);
          weightY = ((y*2)-medY);
          //stack the calculated points on a list
          var point = ({
                                x:    x,
                          weightX:    weightX,
                                y:    y,
                          weightY:    weightY
                       });
          //add the list to the array created before the loop
          PointsWeight.push(point);
      }
      //reset the tmp vars
      x = 0;
      y = 0;
      weightX = 0;
      weightY = 0;
      //loop again, to apply the Center Mass equation using the pre-calcutated mass(weight) that each point has.
      for (i=0; i < PointsWeight.length; i++)
      {
          var obj = PointsWeight[i];
          x += obj.x * (obj.weightX * i+1);
          y += obj.y * (obj.weightY * i+1);
          weightX += obj.weightX * i+1;
          weightY += obj.weightY * i+1;
      }
      //finalize the last part of the equation
      medX = x/weightX;
      medY = y/weightY;
      //add the calculated center point to the 
      myLatlng = new google.maps.LatLng(medX, medY);

      /*
      if(size < points.length)
        points.pop();
      */
      //alert(points.length);

      //Calculate Zoom
      return new google.maps.LatLngBounds(new google.maps.LatLng(minX, minY), new google.maps.LatLng(maxX, maxY));
  }else
    return null;
}

function getMinMaxLatLog(range)
{
  var poiMinLat, poiMaxLat, poiMinLog, poiMaxLog;
  for(var i=0; i<range.length; i++)
  {
    var poi = range[i];
    
    if(poiMinLat == undefined)
      poiMinLat = poi.x;
    else if(poi.x < poiMinLat)
      poiMinLat = poi.x;

    if(poiMaxLat == undefined)
      poiMaxLat = poi.x;
    else if(poi.x > poiMaxLat)
      poiMaxLat = poi.x;
    
    if(poiMinLog == undefined)
      poiMinLog = poi.y;
    else if(poi.y < poiMinLog)
      poiMinLog = poi.y;

    if(poiMaxLog == undefined)
      poiMaxLog = poi.y;
    else if(poi.y > poiMaxLog)
      poiMaxLog = poi.y;
  }
  return {poiMinLat: poiMinLat, poiMaxLat: poiMaxLat, poiMinLog: poiMinLog, poiMaxLog: poiMaxLog};
}
 
function calcCoordDistances(lat1, log1, lat2, log2)
{
    var lat1rad = (lat1 / 180) * Math.PI;
    var log1rad = (log1 / 180) * Math.PI;
    var lat2rad = (lat2 / 180) * Math.PI;
    var log2rad = (log2 / 180) * Math.PI;
    
    return Math.acos(
             Math.sin(lat1rad) * Math.sin(lat2rad) +
             Math.cos(lat1rad) * Math.cos(lat2rad) *
             Math.cos(log2rad - log1rad)
           ) * 6378.1;
}

  
function setHistoryLastFnc(function_str)
{
  var hist = localStore('history');
  if(!isArray(hist))
    hist = Array();
  hist.push(function_str);
  localStore('history', 'save', hist);
}

function getHistoryLastFnc()
{
  var hist = localStore('history');
  if(!isArray(hist)){
    return false;
  }else{
    var ret = hist.pop();
    ret = hist.pop();
    localStore('history', 'save', hist);
    return ret;
  }
}
  
function highlightMenu(menuBtnId)
{
  if(document.getElementById('menu') && document.getElementById('menu').childNodes)
  {
    for(var i=0; i<document.getElementById('menu').childNodes.length; i++){
      var ele = document.getElementById('menu').childNodes[i];
      if(ele.id == menuBtnId)
        ele.className = 'btn_selected';
      else
        ele.className = '';
    }
  }
}
      
function floatClose()
{
  document.getElementById('floatDivContent').innerHTML = "";
  document.getElementById('floatDiv').style.display = 'none';
}
      
function float(type, title, msg, html, yes, no)
{
  var floatDivHtml = "";
  switch(type)
  {
    default:
    case "alert":
      if(title)
        floatDivHtml += "<h3>"+title+"</h3>";
      if(msg)
        floatDivHtml += "<p>"+msg+"</p>";
      
      floatDivHtml += "<div class='btn' onclick='floatClose()'>OK</div>";
      
    break;

    case "confirm":
      if(title)
        floatDivHtml += "<h3>"+title+"</h3>";
      if(msg)
        floatDivHtml += "<p>"+msg+"</p>";
      
      floatDivHtml += "<div class='btn' style='float: left;' ";
      if(yes)
        floatDivHtml += "onclick='floatClose();"+yes+"'";
      floatDivHtml += " >Yes</div>";
      
      floatDivHtml += "<div class='btn' style='float: right;'";
      if(no)
        floatDivHtml += "onclick='floatClose();"+no+"'";
      floatDivHtml += " >No</div>";
    break;
      
    case "custom":
      if(title)
        floatDivHtml += "<h3>"+title+"</h3>";  
      if(msg)
        floatDivHtml += "<p>"+msg+"</p>";
      if(html)
        floatDivHtml += objDecode(html);
    break;
  }
  
  if(document.getElementById('floatDivContent'))
    document.getElementById('floatDivContent').innerHTML = floatDivHtml;
  else
    document.getElementById('floatDiv').innerHTML = "<div id='floatDivContent' class='floatDivContent'>"+floatDivHtml+"</div>";
    
  document.getElementById('floatDiv').style.display = 'block';
}

//var loadingThread, dotsCount;
function startLoading()
{
  //dotsCount = 3;
  document.getElementById('floatDiv').style.display = 'block';
  var floatDivHtml = "<div id='loadingAnim' class='loadingAnim'>";
  /*
  floatDivHtml += "<div id='loadDot1' class='loadDot'></div>";
  floatDivHtml += "<div id='loadDot2' class='loadDot'></div>";
  floatDivHtml += "<div id='loadDot3' class='loadDot'></div>";
  */
  floatDivHtml += "</div>";
  
  document.getElementById('floatDiv').innerHTML = floatDivHtml;
  /*
  loadingThreat = window.setInterval(function()
  {
    if(dotsCount > 3)
      dotsCount = 0;
    else
      dotsCount++;
  
    if(document.getElementById('loadingAnim') && document.getElementById('loadingAnim').childNodes)
    {
      var dots = document.getElementById('loadingAnim').childNodes;
      if(dotsCount < 3){
        dots[dotsCount].style.backgroundColor = '#56B7FC';
      }else{
        for(var i=0; i<dots.length; i++)
          dots[i].style.backgroundColor = '';
      }
    }else{
      window.clearInterval(loadingThreat);
    }
  }, 750);*/
}

function stopLoading()
{
  //if(loadingThreat && document.getElementById('floatDiv').childNodes.length > 0 && document.getElementById('floatDiv').childNodes[0].id == 'loadingAnim')
  if(document.getElementById('floatDiv').childNodes.length > 0 && document.getElementById('floatDiv').childNodes[0].id == 'loadingAnim')
  {
    //window.clearInterval(loadingThreat);
    document.getElementById('floatDiv').style.display = 'none';
    document.getElementById('floatDiv').innerHTML = "<div id='floatDivContent' class='floatDivContent'></div>";
  }
}

function dec2Bin(d) {
    var b = '';

    for (var i = 0; i < 8; i++) {
        b = (d%2) + b;
        d = Math.floor(d/2);
    }

    return b;
}

function makeWSdate(){
  var s = new Date();
  var year = s.getFullYear();
  var month = s.getMonth()+1;
  if((String)(month).length < 2)
    month = "0" + month;
  var day = s.getDate();
  if((String)(day).length < 2)
    day = "0" + day;
  var hour = s.getHours();
  if((String)(hour).length < 2)
    hour = "0" + hour;
  var min = s.getMinutes();
  if((String)(min).length < 2)
    min = "0" + min;
  var sec = s.getSeconds();
  if((String)(sec).length < 2)
    sec = "0" + sec;
  return year + "-" + month + "-" + day + "T" + hour + ":" + min + ":" + sec;
}

function getInMapPois(pois)
{
  var resPois = Array();
  for(var i=0; i<pois.length; i++)
  {
    var poi = pois[i];
    if(poi.location.location_x < mapRef.maxLat && poi.location.location_x > mapRef.minLat)
      if(poi.location.location_y < mapRef.maxLog && poi.location.location_y > mapRef.minLog)
        resPois.push(poi);
  }
  return resPois;
}


function checkNetworkState()
{
  var networkState = "";
  if(navigator && navigator.network && navigator.network.connection && navigator.network.connection.type)
    networkState = navigator.network.connection.type;
  return (networkState != "" && networkState != 'none');
}


var MD5 = function (string) {
 
  function RotateLeft(lValue, iShiftBits) {
		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	}
 
	function AddUnsigned(lX,lY) {
		var lX4,lY4,lX8,lY8,lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
 	}
 
 	function F(x,y,z) { return (x & y) | ((~x) & z); }
 	function G(x,y,z) { return (x & z) | (y & (~z)); }
 	function H(x,y,z) { return (x ^ y ^ z); }
	function I(x,y,z) { return (y ^ (x | (~z))); }
 
	function FF(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function GG(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function HH(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function II(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function ConvertToWordArray(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWords_temp1=lMessageLength + 8;
		var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
		var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
		var lWordArray=Array(lNumberOfWords-1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while ( lByteCount < lMessageLength ) {
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount-(lByteCount % 4))/4;
		lBytePosition = (lByteCount % 4)*8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
		lWordArray[lNumberOfWords-2] = lMessageLength<<3;
		lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
		return lWordArray;
	};
 
	function WordToHex(lValue) {
		var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
		for (lCount = 0;lCount<=3;lCount++) {
			lByte = (lValue>>>(lCount*8)) & 255;
			WordToHexValue_temp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
		}
		return WordToHexValue;
	};
 
	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	};
 
	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;
 
	string = Utf8Encode(string);
 
	x = ConvertToWordArray(string);
 
	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
 
	for (k=0;k<x.length;k+=16) {
		AA=a; BB=b; CC=c; DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}
 
	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
 
	return temp.toLowerCase();
}

logging('End of functions.js file');





