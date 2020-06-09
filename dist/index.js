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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
var core = require("@actions/core");
var rest_1 = require("@octokit/rest");
var fs = require("fs");
var path = require("path");
var callbackGlob = require("glob");
var mime_types_1 = require("mime-types");
/**
 * 'Promisified' version of the glob function.
 * @param pattern
 * @param options
 */
function glob(pattern, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        return callbackGlob(pattern, options, function (err, files) {
                            if (err)
                                return reject(err);
                            else {
                                if (files == null || files.length == 0)
                                    throw new Error("No files found.");
                                else
                                    return resolve(files);
                            }
                        });
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Upload a file to the specific GitHub Release URL.
 *
 * @param github - The Octokit instance to use for authenticating the upload.
 * @param uploadUrl - The release's upload URL.
 * @param assetPath - The local filesystem path to the asset to upload.
 */
function uploadFile(github, uploadUrl, assetPath) {
    return __awaiter(this, void 0, void 0, function () {
        var assetName, contentLength, assetContentType, headers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    assetName = path.basename(assetPath);
                    contentLength = function (filePath) { return fs.statSync(filePath).size; };
                    assetContentType = mime_types_1["default"].lookup(assetName) || 'application/octet-stream';
                    headers = { 'content-type': assetContentType, 'content-length': contentLength(assetPath) };
                    // Upload a release asset
                    // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
                    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
                    // @ts-ignore
                    return [4 /*yield*/, github.repos.uploadReleaseAsset({
                            url: uploadUrl,
                            headers: headers,
                            name: assetName,
                            file: fs.readFileSync(assetPath)
                        })];
                case 1:
                    // Upload a release asset
                    // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
                    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
                    // @ts-ignore
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var github_1, uploadUrl_1, targets, files, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    github_1 = new rest_1.Octokit({
                        auth: process.env.GITHUB_TOKEN
                    });
                    uploadUrl_1 = core.getInput('upload_url', { required: true });
                    targets = core.getInput('targets', { required: true });
                    return [4 /*yield*/, glob(targets)];
                case 1:
                    files = _a.sent();
                    console.log("Uploading files: " + JSON.stringify(files));
                    return [4 /*yield*/, Promise.all(files.map(function (file) {
                            console.log("Uploading " + file + "...");
                            return uploadFile(github_1, uploadUrl_1, file);
                        }))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    core.setFailed(error_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Run the module.
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, run()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
