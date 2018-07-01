"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
;
var FeatureToggles = (function () {
    function FeatureToggles(params) {
        var _this = this;
        this.trace = {};
        this.middleware = function (request, _, next) {
            _this.context = _this.getContext(request);
            next();
        };
        this.getX = function (name) { return __awaiter(_this, void 0, void 0, function () {
            var feature, err, checks, overrides, overridesResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.trace[name] = {
                            checks: null,
                            overrides: null,
                        };
                        feature = this.features[name];
                        if (!feature) {
                            err = "There's no feature named " + name;
                            this.trace[name] = err;
                            throw new Error(err);
                        }
                        checks = feature.checks, overrides = feature.overrides;
                        if (!overrides) return [3, 2];
                        return [4, this.getCheckGroup(overrides, name, 'overrides')];
                    case 1:
                        overridesResult = _a.sent();
                        if (overridesResult) {
                            return [2, overridesResult];
                        }
                        _a.label = 2;
                    case 2: return [2, this.getCheckGroup(checks, name, 'checks')];
                }
            });
        }); };
        this.get = function (name) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this.getX(name).catch(function (err) {
                        _this.trace[name].error = err;
                        return false;
                    })];
            });
        }); };
        this.debug = function () {
            return _this.trace;
        };
        this.getCheckGroup = function (group, name, type) { return __awaiter(_this, void 0, void 0, function () {
            var results, resolvedResults, _i, resolvedResults_1, res;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = Object.keys(group).map(function (checkKey) {
                            var checkFunc = group[checkKey];
                            return checkFunc(checkKey, _this.context);
                        });
                        return [4, Promise.all(results)];
                    case 1:
                        resolvedResults = _a.sent();
                        for (_i = 0, resolvedResults_1 = resolvedResults; _i < resolvedResults_1.length; _i++) {
                            res = resolvedResults_1[_i];
                            if (!this.trace[name][type]) {
                                this.trace[name][type] = {};
                            }
                            this.trace[name][type][res[0]] = res[1];
                            if (!res[1]) {
                                return [2, false];
                            }
                        }
                        return [2, true];
                }
            });
        }); };
        this.store = params.store;
        if (params.getContext) {
            this.getContext = params.getContext;
        }
        else {
            this.getContext = function (request) {
                return {
                    key: uuid_1.v4(),
                    request: request
                };
            };
        }
        this.features = params.features;
    }
    return FeatureToggles;
}());
exports.FeatureToggles = FeatureToggles;
//# sourceMappingURL=FeatureToggles.js.map