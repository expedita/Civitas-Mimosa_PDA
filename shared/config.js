/* 
The shared directory contains JavaScript files which can be accessed from both the client and the cloud.

Shared files can be included from client-side html files using a standard script tag as if they were in 
the same directory as the client side file - e.g.:
<script src="config.js" type="text/javascript"></script>

Shared files are automatically loaded and made available to the cloud script executor. This means that any
functions of variables contained in files within the shared directory can be accessed as if they were in the
cloud directory.
*/

/* 
This file - config.js - is used to demonstrate the best practice method for allowing configuration information
to be bundled with the app when it is built, but also allowing the latest version of the configuration to be 
retrieved by the app from the cloud on start up.
*/

var config = {
  param1 : 'Initial value',
  param2 : true
};

var nLogging = 0;

function logging(msg)
{
  /*
  if(document.getElementById('loggingDiv'))
  {
    if(msg != "new"){
      msg = nLogging + " - " + msg;
      nLogging++;
      document.getElementById('loggingDiv').innerHTML += msg + "<br/>";
      $fh.log( { message: msg } );
    }
  }
  
  /*
  $fh.web( { 
    url: 'http://rotas.inmadeira.com/debug2.php',
    method: 'GET',
    charset: 'UTF-8',
    contentType: 'text/xml',
    params: [
      {name:'user', value:'debug'},
      {name:'pass', value:'exped1ta'},
      {name:'action', value:msg},
    ],
    period: 360000
  }, function (res) 
  {});*/
  
}
  
//logging('new');