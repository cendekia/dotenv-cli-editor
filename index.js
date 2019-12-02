#!/usr/bin/env node
const program = require('commander');
const dotenv = require('dotenv')
var fs = require('fs');
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

                    if (cmdObj.value.split(" ").length > 1) cmdObj.value = '"'+cmdObj.value+'"';

                    let oldVal = config[`${envKey}`];
                    config[`${envKey}`] = cmdObj.value;

                    var logger = fs.createWriteStream(cmdObj.path, {
                        flags: 'a'
                    })
                    
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
    }).on('--help', function() {
        console.log('');
        console.log('Examples:');
        console.log('');
        console.log('  $ envi edit APP_NAME -v AwesomeAppName');
        console.log('  $ envi edit APP_NAME -v "Awesome App Name" -p ./AwesomeApp/.env');
        console.log('  $ envi edit APP_NAME --value "Awesome Application Name" --path ./AwesomeApp/.env');
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