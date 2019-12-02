const dotenv = require('dotenv');
var fs = require('fs');

function updateEnv(envKey, cmdObj) {
  fs.readFile(cmdObj.path, function(err, buf) {
    if (err) {
      console.log(err.toString());
      process.exit(1);
    } else {
      let config = dotenv.parse(buf);
      
      //check the key is exist
      if (!(`${envKey}` in config)) {
        console.log(`${envKey} doesn't exist, maybe you should consider using "dotenv add" instead`);
        process.exit(1);
      } else {
        fs.truncate(cmdObj.path, 0, function(){});

        if (cmdObj.value.split(" ").length > 1) cmdObj.value = `"${cmdObj.value}"`;

        let oldVal = config[`${envKey}`];
        config[`${envKey}`] = cmdObj.value;

        var logger = fs.createWriteStream(cmdObj.path, {
          flags: 'a'
        });
        
        Object.keys(config).map(key => {
          logger.write(key+'='+config[key]+'\n');
        })
        logger.end();
        
        console.log(`Updating from ${envKey}=${oldVal} to ${envKey}=${cmdObj.value}`);
        console.log('');
        console.log(`Your dotenv is updated.`);
      }
    }
  });
}

function addEnv(input) {
  fs.readFile(input.path, function(err, buf) {
    if (err) {
      console.log(err.toString());
      process.exit(1);
    } else {
      let config = dotenv.parse(buf);
      
      fs.truncate(input.path, 0, function(){});

      if (input.value.split(" ").length > 1) input.value = `"${input.value}"`;

      config[`${input.newkey}`] = input.value;

      var logger = fs.createWriteStream(input.path, {
        flags: 'a'
      });
      
      Object.keys(config).map(key => {
        logger.write(key+'='+config[key]+'\n');
      })
      logger.end();
      
      console.log(`Adding new env ${input.newkey}=${input.value}`);
      console.log('');
      console.log(`Your dotenv is updated.`);
    }
  });
}

module.exports = {
  updateEnv,
  addEnv
}