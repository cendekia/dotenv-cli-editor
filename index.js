#!/usr/bin/env node
const fs = require('fs');
const dotenv = require('dotenv');
const envi = require('./lib/envi.js') 
const inquirer = require('inquirer');
const program = require('commander');

var defaultDotEnv = '.env';

program.version(require('./package.json').version);

program
  .command('show')
  .option('-k, --key <paramKey>', 'show value of its param key name')
  .option('-p, --path [envFilePath]', 'dotenv file location path', '.env')
  .description('Show specific or all parameters and value at dotenv')
  .action((cmdObj) => {
    fs.readFile(cmdObj.path, function(err, buf) {
      if (err) {
        console.log(err.toString());
      } else {
        const config = dotenv.parse(buf);
        if (cmdObj.key) {
          console.log(config[`${cmdObj.key}`]);
        } else {
          console.log(config);
        }
      }
    });
  });

program
  .command('edit <envKey>')
  .option('-v, --value <newEnvValue>', 'new dotenv param value')
  .option('-p, --path [envFilePath]', 'dotenv file location path', '.env')
  .description('Edit specific env parameter value')
  .action((envKey, cmdObj) => {
    defaultDotEnv = cmdObj.path;
    envi.updateEnv(envKey, cmdObj);
  }).on('--help', function() {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ envi edit APP_NAME -v AwesomeAppName');
    console.log('  $ envi edit APP_NAME -v "Awesome App Name" -p ./AwesomeApp/.env');
    console.log('  $ envi edit APP_NAME --value "Awesome Application Name" --path ./AwesomeApp/.env');
  });

program
  .command('add')
  .option('-n, --newkey <newEnvKey>', 'new env parameter key')
  .option('-v, --value [newEnvValue]', 'new env value')
  .option('-p, --path [envFilePath]', 'dotenv file location path', '.env')
  .description('Add new parameter to your dotenv')
  .action((cmdObj) => {
    if (typeof cmdObj.newkey == 'undefined') {
      var questions = [
        {
            type: 'input',
            name: 'path',
            message: 'Where is the path location of .env file:',
            default: defaultDotEnv
        },
        {
            type: 'input',
            name: 'newkey',
            message: 'Please add new param key (e.g. AWESOME_PARAM):'
        },
        {
            type: 'input',
            name: 'value',
            message: `Then type/paste the value:`
        },
        {
          type: 'confirm',
          name: 'confirmation',
          message: `Are you sure will add and save it:`
        }];
    } else {
      var questions = [{
        type: 'confirm',
        name: 'confirmation',
        message: `Are you sure will add and save it:`
      }];
    }
    
    inquirer
      .prompt(questions)
      .then(answers => {
        if (answers.confirmation) {
          (cmdObj.newkey) ? envi.addEnv(cmdObj) : envi.addEnv(answers);
        } else {
          console.log('');
          console.log('Add new env has been canceled.')
        }
      });
  });


program.arguments('<command>').action(command => {
  console.log(`Command ${command} not found\n`);
  program.outputHelp();
});


program.usage('<command>');

if (process.argv.length <= 2) {
  // If no command mentioned then output help
  program.outputHelp();
}

// Parse arguments
program.parse(process.argv);