"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWorkflows = loadWorkflows;
exports.saveWorkflows = saveWorkflows;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const data_1 = require("./data");
const DATA_FILE = path_1.default.join(process.cwd(), "workflows.json");
async function loadWorkflows() {
    try {
        const data = await promises_1.default.readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    }
    catch (error) {
        // If file doesn't exist or is invalid, return default/empty
        console.log("No existing data file found, using defaults.");
        return { ...data_1.workflows };
    }
}
async function saveWorkflows(workflows) {
    try {
        await promises_1.default.writeFile(DATA_FILE, JSON.stringify(workflows, null, 2), "utf-8");
    }
    catch (error) {
        console.error("Failed to save workflows:", error);
        throw error;
    }
}
