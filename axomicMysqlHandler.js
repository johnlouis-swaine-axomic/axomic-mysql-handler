var mysql               = require('mysql');

var singleton = function singleton(){

    var connections = null;

    init();

    function init() {
        connections = {};

        connections.getConnection = function(coreObj, callback) {
            coreObj.getConnectionCallback = callback;
            if(connections[coreObj.host] !== undefined) {
                getPooledConnection(coreObj, coreObj.getConnectionCallback);
            } else {
                coreObj.getPoolConCallback = coreObj.getConnectionCallback;
                getMysqlConnection(coreObj);
            } 
        }

        function getMysqlConnection(coreObj) {
            connections[coreObj.host] =  mysql.createPool({
                  host     : coreObj.host,
		  database : coreObj.database,
                  multipleStatements: coreObj.multipleStatements || false,
                  connectionLimit: coreObj.connectionLimit || 5,
                  user     : coreObj.user,
                  password : coreObj.password
            }); 
            getPooledConnection(coreObj, coreObj.getPoolConCallback);
        }

        function getPooledConnection(coreObj, callback) {
            connections[coreObj.host].getConnection(function(err, newCon) {
                if(!err) {
                    coreObj.connection = newCon;
                    callback(coreObj);
                } else {
                    console.log("Error Getting Pool Connection: ", err);
                }
            });   
        }
    }
    this.con = function() {
        return connections;
    }

    if(singleton.caller != singleton.getInstance){
        throw new Error("mysqlconnection object cannot be instantiated");
    }
}

singleton.instance = null;

singleton.getInstance = function(){
        if(this.instance === null) {
            this.instance = new singleton();
        }
        return this.instance;
}

module.exports = singleton.getInstance();
