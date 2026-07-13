"use strict";
// const app = require("../../dist/app").default;
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../src/app"));
// module.exports = (req, res) => app(req, res);
exports.default = app_1.default;
