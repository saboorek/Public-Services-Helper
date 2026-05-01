"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var discord_js_1 = require("discord.js");
var fs = require("fs");
var path = require("path");
var TOKEN = process.env.TOKEN;
var CLIENT_ID = process.env.CLIENT_ID;
var GUILD_ID = process.env.GUILD_ID;
if (!TOKEN || !CLIENT_ID) {
    console.error("❌ Błąd konfiguracji: Upewnij się, że TOKEN i CLIENT_ID są ustawione w .env.");
    process.exit(1);
}
var commandsPath = path.join(__dirname, 'src', 'commands');
var commandsData = [];
function loadAllCommands() {
    return __awaiter(this, void 0, void 0, function () {
        var folders, _i, folders_1, folder, categoryPath, indexFile, command, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    folders = fs.readdirSync(commandsPath);
                    _i = 0, folders_1 = folders;
                    _a.label = 1;
                case 1:
                    if (!(_i < folders_1.length)) return [3 /*break*/, 6];
                    folder = folders_1[_i];
                    categoryPath = path.join(commandsPath, folder);
                    if (!fs.statSync(categoryPath).isDirectory())
                        return [3 /*break*/, 5];
                    indexFile = path.join(categoryPath, "index.ts");
                    if (!fs.existsSync(indexFile)) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    console.log("\uD83D\uDCE6 \u0141aduj\u0119 komend\u0119: ".concat(folder));
                    return [4 /*yield*/, Promise.resolve("".concat(indexFile)).then(function (s) { return require(s); })];
                case 3:
                    command = (_a.sent()).default;
                    if (command && command.data) {
                        commandsData.push(command.data.toJSON());
                    }
                    else {
                        console.warn("\u26A0\uFE0F Pomini\u0119to komend\u0119 w ".concat(folder, "/index.ts \u2013 brak poprawnego eksportu 'default' lub 'data'."));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("\u274C B\u0142\u0105d podczas importowania komendy z folderu ".concat(folder, ": ").concat(err_1));
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function deploy() {
    return __awaiter(this, void 0, void 0, function () {
        var rest, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadAllCommands()];
                case 1:
                    _a.sent();
                    if (commandsData.length === 0) {
                        console.log("⚠️ Nie znaleziono żadnych komend do wczytania.");
                        return [2 /*return*/];
                    }
                    rest = new discord_js_1.REST({ version: '10' }).setToken(TOKEN);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    console.log("\uD83D\uDCE1 Rozpoczynam od\u015Bwie\u017Canie ".concat(commandsData.length, " komend..."));
                    return [4 /*yield*/, rest.put(discord_js_1.Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commandsData })];
                case 3:
                    data = _a.sent();
                    console.log("\u2705 Pomy\u015Blnie za\u0142adowano ".concat(data.length, " komend do Discord API na serwerze ").concat(GUILD_ID, "."));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ BŁĄD PODCZAS REJESTRACJI KOMEND:');
                    console.error(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
deploy();
