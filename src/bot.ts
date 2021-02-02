import * as crypto from "crypto";

var steam = require("steam"),
    util = require("util"),
    fs = require("fs"),
    dota2 = require("dota2"),
    steamClient = new steam.SteamClient(),
    steamUser = new steam.SteamUser(steamClient),
    steamFriends = new steam.SteamFriends(steamClient),
    Dota2 = new dota2.Dota2Client(steamClient, true);
var config: any = require("./config");

class Bot {
    logOnDetails: any = {
        account_name: config.steam_user,
        password: config.steam_pass,
    };
    constructor() {
        this.checkServers();
        this.botSteamConnect();
        this.checkLogOnDetails(this.logOnDetails);
    }

    botSteamConnect() {
        var logOnDetails = this.logOnDetails;
        steamClient.connect();
        steamClient.on("connected", function () {
            steamUser.logOn(logOnDetails);
        });
        steamClient.on("logOnResponse", this.onSteamLogOn);
        steamClient.on("loggedOff", this.onSteamLogOff);
        steamClient.on("error", this.onSteamError);
        steamClient.on("servers", this.onSteamServers);
        steamUser.on(
            "updateMachineAuth",
            function (sentry: any, callback: any) {
                var hashedSentry: any = crypto
                    .createHash("sha1")
                    .update(sentry.bytes)
                    .digest();
                fs.writeFileSync("sentry", hashedSentry);
                util.log("sentryfile saved");
                callback({
                    sha_file: hashedSentry,
                });
            }
        );
    }

    checkLogOnDetails(logOnDetails: any) {
        if (config.steam_guard_code)
            logOnDetails.auth_code = config.steam_guard_code;
        if (config.two_factor_code)
            logOnDetails.two_factor_code = config.two_factor_code;

        try {
            var sentry = fs.readFileSync("sentry");
            if (sentry.length) logOnDetails.sha_sentryfile = sentry;
        } catch (beef) {
            util.log("Cannae load the sentry. " + beef);
        }
    }

    checkServers() {
        if (fs.existsSync("servers")) {
            steam.servers = JSON.parse(fs.readFileSync("servers"));
        }
    }

    exitDota() {
        Dota2.exit();
        this.onSteamLogOff;
    }

    createDotaLobby() {
        Dota2.createPracticeLobby(
            {
                game_name: "Mithvs Game",
                server_region: dota2.ServerRegion.Unspecified,
                game_mode: dota2.schema.DOTA_GameMode.DOTA_GAMEMODE_ALL_DRAFT,
                series_type: 2,
                game_version: 1,
                allow_cheats: false,
                fill_with_bots: false,
                allow_spectating: true,
                pass_key: "123",
                radiant_series_wins: 0,
                dire_series_wins: 0,
                allchat: true,
            },
            function (err: any, body: any) {
                console.log(JSON.stringify(body));
            }
        );
        Dota2.joinPracticeLobbyTeam(2, 4);
    }

    leaveDotaLobby() {
        Dota2.leavePracticeLobby(function (err: any, body: any) {
            console.log(JSON.stringify(body));
        });
    }

    matchDataLobby(id: any) {
        Dota2.requestMatchDetails(id);
        Dota2.on("matchDetailsData", function (matchId: any, matchData: any) {
            return matchData;
        });
    }

    inviteToDotaLobby(id: any) {
        Dota2.inviteToLobby(id);
    }
    startGameLobby() {
        Dota2.launchPracticeLobby();
        Dota2.abandonCurrentGame();
        setTimeout(function () {}, 5000);
    }

    onSteamLogOn(logonResp: any) {
        if (logonResp.eresult == steam.EResult.OK) {
            steamFriends.setPersonaState(steam.EPersonaState.Busy); // to display your steamClient's status as "Online"
            steamFriends.setPersonaName(config.steam_name); // to change its nickname
            util.log("Logged on.");
            Dota2.launch();
            Dota2.on("ready", function () {
                console.log("Node-dota2 ready.");

                /* CHAT */
                // Event based
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
    }
    onSteamServers(servers: any) {
        util.log("Received servers.");
        fs.writeFile("servers", JSON.stringify(servers), (err: any) => {
            if (err) {
                if (servers.debug) util.log("Error writing ");
            } else {
                if (servers.debug) util.log("");
            }
        });
    }
    onSteamLogOff(eresult: any) {
        util.log("Logged off from Steam.");
    }
    onSteamError(error: any) {
        util.log("Connection closed by server: " + error);
    }
}

export default Bot;
