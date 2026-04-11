/**
 * Update check for GH-PI extension
 *
 * Fetches the latest version from npm registry and compares with current version
 * to notify users when an update is available.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PACKAGE_NAME = "@the-forge-flow/gh-pi";

export interface UpdateInfo {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
}

/**
 * Read current version from package.json
 */
function getCurrentVersion(): string {
	try {
		const packageJsonPath = join(__dirname, "..", "package.json");
		const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
		return packageJson.version || "0.0.0";
	} catch {
		return "0.0.0";
	}
}

/**
 * Compare semantic versions (returns true if latest > current)
 */
function compareVersions(current: string, latest: string): boolean {
	const cleanVersion = (v: string) => v.replace(/^v/, "");
	const currentParts = cleanVersion(current).split(".").map(Number);
	const latestParts = cleanVersion(latest).split(".").map(Number);

	for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
		const curr = currentParts[i] || 0;
		const lat = latestParts[i] || 0;
		if (lat > curr) return true;
		if (lat < curr) return false;
	}
	return false;
}

/**
 * Fetch latest version from npm registry
 * Uses npm view command, falls back to curl to registry API
 */
async function fetchLatestVersion(): Promise<string | null> {
	try {
		// Try using npm view (most reliable)
		const result = execSync(`npm view ${PACKAGE_NAME} version`, {
			encoding: "utf-8",
			timeout: 5000,
			stdio: ["pipe", "pipe", "pipe"],
		});

		const version = result.trim();
		if (version) {
			return version;
		}
	} catch {
		// npm not available or failed, try curl to registry API
		try {
			const url = `https://registry.npmjs.org/${PACKAGE_NAME}/latest`;
			const result = execSync(`curl -s ${url}`, {
				encoding: "utf-8",
				timeout: 5000,
			});

			const data = JSON.parse(result);
			if (data.version) {
				return data.version;
			}
		} catch {
			// Silently fail - update check is not critical
		}
	}

	return null;
}

/**
 * Check if an update is available
 * Returns null if check fails (silently)
 */
export async function checkForUpdates(): Promise<UpdateInfo | null> {
	const currentVersion = getCurrentVersion();
	const latestVersion = await fetchLatestVersion();

	if (!latestVersion) {
		return null;
	}

	const updateAvailable = compareVersions(currentVersion, latestVersion);

	return {
		currentVersion,
		latestVersion,
		updateAvailable,
	};
}
