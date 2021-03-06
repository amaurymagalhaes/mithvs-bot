import * as crypto from "crypto";
var steam = require("steam"),
  util = require("util"),
  fs = require("fs"),
  dota2 = require("dota2"),
  steamClient = new steam.SteamClient(),
  steamUser = new steam.SteamUser(steamClient),
  steamFriends = new steam.SteamFriends(steamClient),
  Dota2 = new dota2.Dota2Client(steamClient, true);

/* Steam logic */
var config: any = require("./config");
if (fs.existsSync("servers")) {
  steam.servers = JSON.parse(fs.readFileSync("servers"));
}

var onSteamLogOn = function onSteamLogOn(logonResp: any) {
    if (logonResp.eresult == steam.EResult.OK) {
      steamFriends.setPersonaState(steam.EPersonaState.Busy); // to display your steamClient's status as "Online"
      steamFriends.setPersonaName(config.steam_name); // to change its nickname
      util.log("Logged on.");
      Dota2.launch();
      Dota2.on("ready", function () {
        console.log("Node-dota2 ready.");

        /* CHAT */
        // Event based
        Dota2.joinChat("rj");
        setTimeout(function () {
          Dota2.sendMessage("wowoeagnaeigniaeg", "rj");
        }, 5000);
        setTimeout(function () {
          Dota2.leaveChat("rj");
        }, 10000);
        /* LOBBIES */
        Dota2.createPracticeLobby(
          {
            game_name: "node-dota2",
            server_region: dota2.ServerRegion.PERFECTWORLDTELECOM,
            game_mode: dota2.schema.DOTA_GameMode.DOTA_GAMEMODE_AR,
            series_type: 2,
            game_version: 1,
            allow_cheats: false,
            fill_with_bots: false,
            allow_spectating: true,
            pass_key: "password",
            radiant_series_wins: 0,
            dire_series_wins: 0,
            allchat: true,
          },
          function (err: any, body: any) {
            console.log(JSON.stringify(body));
          }
        );
        setTimeout(function () {
          Dota2.leavePracticeLobby(function (err: any, body: any) {
            console.log(JSON.stringify(body));
          });
        }, 60000);
      });
      Dota2.on("unready", function onUnready() {
        console.log("Node-dota2 unready.");
      });
      Dota2.on(
        "chatMessage",
        function (channel: any, personaName: any, message: any) {
          // util.log([channel, personaName, message].join(", "));
        }
      );
      Dota2.on(
        "guildInvite",
        function (guildId: any, guildName: any, inviter: any) {
          // Dota2.setGuildAccountRole(guildId, 75028261, 3);
        }
      );
      Dota2.on("unhandled", function (kMsg: any) {
        util.log("UNHANDLED MESSAGE " + dota2._getMessageName(kMsg));
      });
      // setTimeout(function(){ Dota2.exit(); }, 5000);
    }
  },
  onSteamServers = function onSteamServers(servers: any) {
    util.log("Received servers.");
    fs.writeFile("servers", JSON.stringify(servers), (err: any) => {
      if (err) {
        if (servers.debug) util.log("Error writing ");
      } else {
        if (servers.debug) util.log("");
      }
    });
  },
  onSteamLogOff = function onSteamLogOff(eresult: any) {
    util.log("Logged off from Steam.");
  },
  onSteamError = function onSteamError(error: any) {
    util.log("Connection closed by server: " + error);
  };

steamUser.on("updateMachineAuth", function (sentry: any, callback: any) {
  var hashedSentry: any = crypto
    .createHash("sha1")
    .update(sentry.bytes)
    .digest();
  fs.writeFileSync("sentry", hashedSentry);
  util.log("sentryfile saved");
  callback({
    sha_file: hashedSentry,
  });
});

// Login, only passing authCode if it exists
var logOnDetails: any = {
  account_name: config.steam_user,
  password: config.steam_pass,
};
if (config.steam_guard_code) logOnDetails.auth_code = config.steam_guard_code;
if (config.two_factor_code)
  logOnDetails.two_factor_code = config.two_factor_code;

try {
  var sentry = fs.readFileSync("sentry");
  if (sentry.length) logOnDetails.sha_sentryfile = sentry;
} catch (beef) {
  util.log("Cannae load the sentry. " + beef);
}

steamClient.connect();
steamClient.on("connected", function () {
  steamUser.logOn(logOnDetails);
});
steamClient.on("logOnResponse", onSteamLogOn);
steamClient.on("loggedOff", onSteamLogOff);
steamClient.on("error", onSteamError);
steamClient.on("servers", onSteamServers);
