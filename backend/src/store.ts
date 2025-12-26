import fs from "fs/promises";
import path from "path";
import { Workflow } from "./types";
import { workflows as defaultWorkflows } from "./data";

const DATA_FILE = path.join(process.cwd(), "workflows.json");

export async function loadWorkflows(): Promise<Record<string, Workflow>> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return default/empty
    console.log("No existing data file found, using defaults.");
    return { ...defaultWorkflows };
  }
}

export async function saveWorkflows(workflows: Record<string, Workflow>): Promise<void> {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(workflows, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save workflows:", error);
    throw error;
  }
}
