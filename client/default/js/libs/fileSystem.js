var root = null;
var workingDir = null;
var workingFile = null;

function getFileSystem()
{
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
		function(fileSystem)
    { // success get file system
      root = fileSystem.root;
      
      createDir("rotas");
      createDir("rotas/img");
      
		}, function(evt){ // error get file system
			console.log("File System Error: "+evt.target.error.code);
		}
	);
}

function createDir(name)
{
  root.getDirectory(name, {create: true}, function(dir){workingDir = dir;}, fail);
}

function createFile(name)
{
  if(workingDir)
    workingDir.getFile(name, {create: true, exclusive: true}, function(file){workingFile = file;}, fail);
}

function useFile(name){
  if(workingDir)
    workingDir.getFile(name, {create: false, exclusive: true}, function(file){workingFile = file;}, fail);
}

function writeFile(content)
{
  if(workingFile)
    workingFile.createWriter(
      function(writer){
        writer.write(content);
      },
      fail
    );
}

function readFile(fileName)
{
  var file = null;
  root.getFile(fileName, null, 
    function(fileEntry){
      fileEntry.file(
        function(file){
          //console.log(readAsText(file));
          file = readDataUrl(file);
        },
        fail
      );
    },
    fail
  );
}

function readDataUrl(file) {
  var reader = new FileReader();
  reader.onloadend = function(evt) {
      console.log("Read as data URL");
      console.log(evt.target.result);
  };
  return reader.readAsDataURL(file);
}

function readAsText(file) {
  var reader = new FileReader();
  reader.onloadend = function(evt) {
      console.log("Read as text");
      console.log(evt.target.result);
  };
  return reader.readAsText(file);
}

function fail(error) {
    console.log(error.code);
}