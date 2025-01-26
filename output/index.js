"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibraryService = void 0;
exports.default = default_1;
const typedi_1 = require("typedi");
let LibraryService = class LibraryService {
    value = 'Initial value from library';
    setValue(newValue) {
        this.value = newValue;
    }
    getValue() {
        return this.value;
    }
};
exports.LibraryService = LibraryService;
exports.LibraryService = LibraryService = __decorate([
    (0, typedi_1.Service)()
], LibraryService);
const defaultConfig = {};
class App {
    name = 'tsdiapi-prisma';
    config;
    context;
    constructor(config) {
        this.config = { ...config };
    }
    async onInit(ctx) {
        this.context = ctx;
    }
    async beforeStart(ctx) {
    }
}
function default_1(config) {
    return new App(config);
}
//# sourceMappingURL=index.js.map