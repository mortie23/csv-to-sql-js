#!/usr/bin/node
// Author:  Christopher Mortimer
// Date:    2020-01-07
// Desc:    Create a MySQL table from a CSV
// Dep:     npm install csvtojson@latest --save
//          npm install fs@latest --save
// Usage:   ./index.js csvfile dbschema
// Example: ./index.js ./data-classes.csv mysql_schema

const csvfile = process.argv[2];
const dbschema = process.argv[3];
console.log('csvfile: '+csvfile+' dbschema: '+dbschema);

const csvtojson = require('csvtojson');
const fs = require('fs');

// Convert a csv file with csvtojson
csvtojson()
  .fromFile(csvfile)
  .then(function (jsonArrayObj) {
    // Get list of keys (columns)
    var keys = Object.keys(jsonArrayObj[0]);

    dropCreate = generateDDL(keys);
    fs.writeFileSync("./inserts.sql", dropCreate);

    // Generate the list of columns in the insert statement
    fs.appendFileSync("./inserts.sql", "insert into "+dbschema+".data_classes (");
    for (var j = 0; j < keys.length; j++) {
      if (j === 0) {
        fs.appendFileSync("./inserts.sql", keys[j]);
      } else {
        fs.appendFileSync("./inserts.sql", ',' + keys[j]);
      }
    }
    fs.appendFileSync("./inserts.sql", ") \n values ");
    // Generate the values in the insert statement
    for (var i = 0; i < jsonArrayObj.length; i++) {
      var obj = jsonArrayObj[i];
      if (i === 0) {
        fs.appendFileSync("./inserts.sql", '\n(')
      } else {
        fs.appendFileSync("./inserts.sql", '\n,(')
      }
      for (var k = 0; k < keys.length; k++) {
        if (k === 0) {
          fs.appendFileSync("./inserts.sql", "'" + obj[keys[k]] + "'");
        } else {
          fs.appendFileSync("./inserts.sql", "," + "'" + obj[keys[k]] + "'");
        }
      }
      fs.appendFileSync("./inserts.sql", ')')
    }
    fs.appendFileSync("./inserts.sql", "; ");
  })

function generateDDL(keys) {
  // Column definition for the table
  const idcol = 'id int not null AUTO_INCREMENT';
  const primaryKeyDefinition = ', PRIMARY KEY (id)';
    ;
  // Drop create statement
  const dropStatement = "drop table if exists "+dbschema+".data_classes;";
  const createHeader = "create table "+dbschema+".data_classes (";
  const createFooter = ');';
  var colDef = '';
  for (var j = 0; j < keys.length; j++) {
    colDef = colDef+','+keys[j]+' varchar(100)\n'
  }
  return dropStatement+'\n'+createHeader+'\n'+idcol+'\n'+colDef+'\n'+primaryKeyDefinition+'\n'+createFooter;
}