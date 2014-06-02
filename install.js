/**
 * This file is part of Cjdmaid.
 *
 * Cjdmaid program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

var fs = require("fs");
var when = require("when");
var nodefn = require("when/node/function");
var JSONcomments = require("json-comments-js");
var childProcess = require("child_process");

var util = require(__dirname + "/lib/util");
var config = require(__dirname + "/lib/config");
var commfn = require(__dirname + "/lib/commander/function");

var cjdmaidConf = {
    "cjdrouteConf": "/etc/cjdroute.conf",
    "cjdnsadminConf": "~/.cjdnsadmin",
    "passwordLength": 48,
    "ownNodeData": {
        /* OPTIONAL */
        "name": "Your Name",
        "email": "your@address.com",
        "location": "Some Place",
        "ip": "555.555.55.5"
    }
};

when(commfn.call(fs.exists, fs, config.CJDMAID_CONFIG_PATH)).then(function(exists) {
    if (exists) {
        console.log(config.CJDMAID_CONFIG_PATH + " already exists");
        return when(
        config.readCustomConf("cjdmaidConf")).then(function(data) {
            if (util.isDef(data.ownNodeData)) {
                console.log("Now installed");
            } else {
                data.ownNodeData = {
                    "name": data.name,
                    "email": data.email,
                    "location": data.location,
                    "ip": data.ip
                };
                var pushObject = util.cloneObject(data);

                delete pushObject.name;
                delete pushObject.email;
                delete pushObject.location;
                delete pushObject.ip;

                return when(
                config.writeCustomConf("cjdmaidConf", pushObject)).then(function() {
                    console.log("Now installed");
                });
            }
        }).then(function() {
            return when.reject();
        });
    }

    cjdmaidConf["/**/"] = config.CONFIGS_COMMENTS.cjdmaidConf;

    var writingText = JSONcomments.stringify(cjdmaidConf, null, "\t");

    return when(nodefn.call(fs.writeFile, config.CJDMAID_CONFIG_PATH, writingText)).then(function() {
        console.log(config.CJDMAID_CONFIG_PATH + " saved!");
    }).otherwise(function(err) {
        if (err) {
            console.log("WARNING! " + config.CJDMAID_CONFIG_PATH + " " + "is not created! Here error: " + err + ". " + "You need create it by yourself. ");
            return when.reject(err);
        }
    });
}).then(function() {
    var editor = process.env.EDITOR || "vi";

    console.log("Editing " + config.CJDMAID_CONFIG_PATH + "...");
    var child = childProcess.spawn(editor, [config.CJDMAID_CONFIG_PATH], {
        stdio: "inherit"
    });

    child.on("exit", function() {
        console.log("Now installed");
    });
});

