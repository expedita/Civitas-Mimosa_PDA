logging('Start of languages.js file');
var en = {
  PT : 'Português',
  EN : 'English',
  title : 'Funchal Routes',
  routes : 'Walks',
  around : 'Around Here',
  download : 'Download',
  settings : 'Settings',
  wellcomeMSG1 : 'Welcome to',
  wellcomeMSG2 : 'Funchal Routes mobile application',
  connectivityWarning : "This action requires an internet connection, be carfull if you're not using a wifi connection. Depending on the contract with your mobile operator this action may be very expensive!",
  addRoutesLocalStorage : "Add Routes to your local storage",
  localRoutes : "Local Routes",
  noRoutesToShow : "No routes to show...",
  showDynMap : "Show Dynamic Map",
  showStatMap : "Show Static Map",
  availRoutesList : "Available Routes list",
  routeIncludedSuccess : "Route included successfuly in your local routes list!",
  addRouteErr : "Something went wrong while adding this Route!",
  remRouteQuest : "Are you shore to remove this route from your local list?",
  remRouteErr : "Something went wrong while removing this Route!",
  getRouteFromWebErr : "An error has occurred while getting routes information form the web.\r\nCheck your internet connectivity!",
  near : "Near",
  normal : "Medium",
  far : "More Distant",
  poisNotFound : "No Points of Interest found at this range!",
  downRouteBeforePois : "You have to download routes before viewing points of interest!",
  noGPS : "We couldn't get your current location, please turn on your GPS!",
  pois : "Points of Interest",
  accountDetailsTitle : "Rotas Account Details",
  delAccountSettings : "Delete Settings",
  fillAccountInfo : "Please fill in your Rotas account information!",
  save : "Save",
  appSettingsTitle : "Application Settings",
  showImgs : "Show Images",
  showImgsWarning : "When this option is active will use internet connection to show the images!",
  setLangLabelInfo : "Choose your Language - You will have to restart this application for the choosed language takes effect!",
  userDataFormErr : "Malformed authentication data, check if the email is valid.",
  rangeMsg: "Choose the range that the points of interest are shown.",
  webCheck: "Access to internet has failed, please turn on your Wifi or 3G!",
  exit : "Exit Application",
  manageRoutes : "Manage Routes",
  newRoute : "New Route",
  newPoi : "Add new",
  signLoc : "Sign Location",
  askNewPoi : "Do you wish to create a new Point of Interest within the last edited Route?",
  askNewRoute : "Do you wish to create a new Route?"
}
    
var pt = {
  PT : 'Português',
  EN : 'English',
  title : 'Rotas Funchal',  
  routes : 'Passeios',
  around : 'Aqui Perto',
  download : 'Download',
  settings : 'Opções',
  wellcomeMSG1 : 'Bem Vindo',
  wellcomeMSG2 : 'à aplicação Rotas Funchal mobile',
  connectivityWarning : "Esta acção requere uma connecção à internet, cuidado caso não esteja a usar uma conecção wifi. Dependendo do contracto com a sua operadora móvel esta acção pode ser muito cara!",
  addRoutesLocalStorage : "Adicione Rotas no seu dispositivo",
  localRoutes : "Rotas no Dispositivo",
  noRoutesToShow : "Sem passeios para mostrar...", 
  showDynMap : "Mostrar mapa dinâmico",
  showStatMap : "Mostrar mapa estático",
  availRoutesList : "Lista de Passeios Disponível",
  routeIncludedSuccess : "O Passeio foi incluído com sucesso na sua lista de passeios local!",
  addRouteErr : "Ocorreu um erro ao tentar adicionar este passeio!",
  remRouteQuest : "Tem a certeza que deseja remover este passeio?",
  remRouteErr : "Ocorreu um erro ao tentar remover este passeio!",
  getRouteFromWebErr : "Ocorreu um erro ao obter informações dos passeios a partir da web.\r\nVerifique a sua conecção à internet!",
  near : "Perto",
  normal : "Médio",
  far : "Mais Distante",
  poisNotFound : "Não foram encontrados Pontos de Interesse neste alcance!",
  downRouteBeforePois : "Tem que efectuar o download de rotas antes de poder visualizar Pontos de Interesse!",
  noGPS : "Não foi possível obter a sua localização, por favor ligue o seu GPS!",
  pois : "Pontos de Interesse",
  accountDetailsTitle : "Os dados do seu perfil",
  delAccountSettings : "Apagar os dados da sua conta",
  fillAccountInfo : "Por favor preencha os dados da sua conta!",
  save : "Guardar",
  appSettingsTitle : "Opções da Aplicação",
  showImgs : "Mostrar Imagens",
  showImgsWarning : "Quando esta opção está activa usa conecção à internet para mostrar as images!",
  setLangLabelInfo : "Escolha a sua Língua - Terá de reiniciar a aplicação para que a nova língua surta efeito!",
  userDataFormErr : "Os dados de autenticação estão incorrectos, verifique se o email é válido.",
  rangeMsg: "Escolha o alcance a que os pontos de interesse são mostrados.",
  webCheck: "Acesso à internet falhou, por favor ligue o seu Wifi ou 3G!",
  exit : "Sair da Aplicação",
  manageRoutes : "Gerir Rotas",
  newRoute : "Nova Rota",
  newPoi : "Adicionar",
  signLoc : "Registar Local",
  askNewPoi : "Deseja criar um novo Ponto de Interesse associado ao último Passeio editado?",
  askNewRoute : "Deseja criar um novo Passeio?"
}
    
var lang = Array(3);

lang[1] = pt;
lang[2] = en;

function l(phrase)
{
  if(isArray(lang) && lang[localStore("language")] && lang[localStore("language")][phrase])
    return lang[localStore("language")][phrase];
  else
    return phrase;
}
logging('end of languages.js file');
