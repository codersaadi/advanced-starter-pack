import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { consola } from "consola";
import { readJsonSync, writeJSONSync } from "fs-extra";
import { markdownToTxt } from "markdown-to-txt";
import semver from "semver";

import { ensureDirectoryExists } from "../utils/common";
import {
  CHANGELOG_INPUT_FILES,
  GENERATED_CHANGELOG_JSON_DIR,
} from "./changelog-paths";

export interface ChangelogStaticItem {
  children: {
    [category: string]: string[];
  };
  date: string;
  version: string;
}

class BuildStaticChangelog {
  private removeDetailsTag = (changelog: string): string => {
    const detailsRegex: RegExp = /<details\b[^>]*>[\S\s]*?<\/details>/gi;
    return changelog.replaceAll(detailsRegex, "");
  };

  private cleanVersion = (version: string): string => {
    return semver.clean(version) || version;
  };

  private formatCategory = (category: string): string => {
    const cate = category.trim().toLowerCase();
    switch (cate) {
      case "bug fixes":
        return "fixes";
      case "features":
        return "features";
      default:
        return "improvements";
    }
  };

  private formatChangelog = (changelog: string): ChangelogStaticItem[] => {
    const cleanedChangelog = this.removeDetailsTag(changelog);
    const input = markdownToTxt(cleanedChangelog);
    const versions = input.split(/Version |Version /).slice(1);
    const output: ChangelogStaticItem[] = [];

    for (const version of versions) {
      const lines = version.trim().split("\n");
      if (lines?.length < 3) continue; // Basic check for enough lines

      const versionNumber = lines[0]?.trim() as string;
      const dateLine = lines.find((line) =>
        line.toLowerCase().includes("released on")
      );
      const date = dateLine
        ? dateLine.replace(/released on /i, "").trim()
        : "Unknown Date";

      const entry: ChangelogStaticItem = {
        children: {},
        date: date,
        version: this.cleanVersion(versionNumber),
      };

      let currentCategory = "";
      let skipSection = false; // This logic might need review based on your exact MD format

      // Start searching for categories after version and date lines
      const startIndex = lines.findIndex((line) =>
        /^\p{Emoji}/u.test(line.trim())
      );
      if (startIndex === -1) continue; // No categories found

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i]?.trim() as string;
        if (line === "") continue;

        if (/^\p{Emoji}/u.test(line)) {
          currentCategory = this.formatCategory(
            line.replace(/^\p{Emoji} /u, "")
          );
          if (!currentCategory) continue; // Skip if category isn't recognized
          entry.children[currentCategory] =
            entry.children[currentCategory] || [];
          skipSection = false;
        } else if (currentCategory && !skipSection) {
          // Ensure currentCategory is set
          // Assuming items are simple lines after a category emoji
          // The original script had 'misc:' prefix logic, which might not be in your CHANGELOG.md
          // If your items are just bullet points or simple lines, this will grab them.
          // Adjust this if your items have specific prefixes like 'misc:'
          if (line.startsWith("- ") || line.startsWith("* ")) {
            // Example for bullet points
            entry.children[currentCategory]?.push(line.substring(2).trim());
          } else if (
            !line.match(/^\p{Emoji}/u) &&
            !line.toLowerCase().includes("released on") &&
            line !== versionNumber
          ) {
            // Fallback for simple lines if not another emoji, release date, or version number
            entry.children[currentCategory]?.push(line);
          }
        }
      }

      for (const category in entry.children) {
        if (entry.children[category]?.length === 0) {
          delete entry.children[category];
        }
      }
      if (Object.keys(entry.children).length > 0) {
        // Only add if there are categorized changes
        output.push(entry);
      }
    }
    return output;
  };

  private mergeAndSortVersions = (
    oldVersions: ChangelogStaticItem[],
    newVersions: ChangelogStaticItem[]
  ): ChangelogStaticItem[] => {
    const mergedVersionsMap = new Map<string, ChangelogStaticItem>();

    // Add old versions to map
    for (const oldVersion of oldVersions) {
      mergedVersionsMap.set(this.cleanVersion(oldVersion.version), oldVersion);
    }

    // Add or update with new versions
    for (const newVersion of newVersions) {
      mergedVersionsMap.set(this.cleanVersion(newVersion.version), newVersion);
    }

    const mergedArray = Array.from(mergedVersionsMap.values());

    // Sort all versions after merging
    return mergedArray.sort((a, b) => {
      try {
        return semver.rcompare(
          this.cleanVersion(a.version),
          this.cleanVersion(b.version)
        );
      } catch (e) {
        // Fallback for non-semver versions, sort alphabetically (descending)
        return b.version.localeCompare(a.version);
      }
    });
  };

  run() {
    ensureDirectoryExists(GENERATED_CHANGELOG_JSON_DIR); // Call the helper

    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.entries(CHANGELOG_INPUT_FILES).forEach(
      ([versionKey, markdownFilePath]) => {
        if (!existsSync(markdownFilePath)) {
          consola.warn(
            `Changelog Markdown file not found for ${versionKey}: ${markdownFilePath}`
          );
          return;
        }
        const data = readFileSync(markdownFilePath, "utf8");
        const newFileItems = this.formatChangelog(data);

        if (newFileItems.length === 0) {
          consola.info(
            `No processable changelog entries found in ${markdownFilePath} for key ${versionKey}.`
          );
          // Decide if you want to write an empty JSON or skip
          // writeJSONSync(outputJsonFilename, [], { spaces: 2 });
          return;
        }

        const outputJsonFilename = resolve(
          GENERATED_CHANGELOG_JSON_DIR,
          `${versionKey}.json`
        );
        let finalJsonOutput = newFileItems;

        if (existsSync(outputJsonFilename)) {
          const oldFileJson =
            readJsonSync(outputJsonFilename, { throws: false }) || [];
          finalJsonOutput = this.mergeAndSortVersions(
            oldFileJson,
            newFileItems
          );
        } else {
          // If no old file, just sort the new items (if multiple versions were in one MD)
          finalJsonOutput = newFileItems.sort((a, b) =>
            semver.rcompare(
              this.cleanVersion(a.version),
              this.cleanVersion(b.version)
            )
          );
        }

        writeJSONSync(outputJsonFilename, finalJsonOutput, { spaces: 2 });
        consola.success(
          `Changelog for ${versionKey} (from ${markdownFilePath}) has been built successfully to ${outputJsonFilename}!`
        );
      }
    );
  }
}

export const buildStaticChangelog = new BuildStaticChangelog();
