// Require the 'cordova-bridge' to enable communications between the
// Node.js app and the Cordova app.
const cordova = require('cordova-bridge');

//sha3 module sample code from its README.
function sha3SampleCode() {
  var SHA3 = require('sha3');
  var result = '';
  // Generate 512-bit digest.
  var d = new SHA3.SHA3Hash();
  d.update('foo');
  result += "Digest 1: " + d.digest('hex') + "\n";   // => "1597842a..."
  // Generate 224-bit digest.
  d = new SHA3.SHA3Hash(224);
  d.update('foo');
  result += "Digest 2: " + d.digest('hex') +"\n";   // => "daa94da7..."
  return result;
}

//sqlite3 module sample code from its README.
function sqlite3SampleCode( resultsCallback ) {
  var sqlite3 = require('sqlite3').verbose();
  var db = new sqlite3.Database(':memory:');

  db.serialize(function() {
    db.run("CREATE TABLE lorem (info TEXT)");

    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.all("SELECT rowid AS id, info FROM lorem", function(err, rows) {
      var result = '';
      rows.forEach((row) =>
        result += row.id + ": " + row.info + "\n"
      );
      resultsCallback(result);
    });

  });

  db.close();
}

cordova.channel.on('message', (msg) => {
  try {
    switch(msg) {
      case 'versions':
        cordova.channel.send(
          "Versions: " +
          JSON.stringify(process.versions)
        );
        break;
      case 'sha3':
        cordova.channel.send(
          "sha3 output:\n" +
          sha3SampleCode()
        );
        break;
      case 'sqlite3':
        sqlite3SampleCode( (result) =>
        cordova.channel.send(
              "sqlite3 output:\n" +
              result
            )
        );
        break;
      default:
        cordova.channel.send(
          "unknown request:\n" +
          msg
        );
        break;
    }
  } catch (err)
  {
    cordova.channel.send("Error: " + JSON.stringify(err) + " => " + err.stack );
  }
});

// Inform cordova node is initialized.
cordova.channel.send("Node was initialized. Versions: " + JSON.stringify(process.versions));
