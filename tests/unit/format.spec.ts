import { describe, expect, it } from "vitest";
import { formatIssueList, formatIssueView, formatPRList, formatPRView } from "../../src/format";

describe("format", () => {
	describe("formatPRList", () => {
		it("formats a list of PRs as compact lines", () => {
			const data = [
				{
					number: 42,
					title: "Fix auth middleware",
					state: "MERGED",
					author: { login: "monsieurbarti" },
					headRefName: "feat/auth",
					baseRefName: "main",
					updatedAt: "2025-04-10T12:00:00Z",
				},
				{
					number: 41,
					title: "Add rate limiting",
					state: "OPEN",
					author: { login: "octocat" },
					headRefName: "feat/rate",
					baseRefName: "main",
					updatedAt: "2025-04-09T08:30:00Z",
				},
			];

			const result = formatPRList(data);

			expect(result).toContain("#42");
			expect(result).toContain("Fix auth middleware");
			expect(result).toContain("MERGED");
			expect(result).toContain("monsieurbarti");
			expect(result).toContain("feat/auth");
			expect(result).toContain("main");
			expect(result).toContain("#41");
			expect(result).toContain("Add rate limiting");
			expect(result).toContain("OPEN");
		});

		it("returns 'No pull requests found.' for empty list", () => {
			expect(formatPRList([])).toBe("No pull requests found.");
		});
	});

	describe("formatPRView", () => {
		it("formats a single PR as a compact summary", () => {
			const data = {
				number: 42,
				title: "Fix auth middleware",
				state: "MERGED",
				author: { login: "monsieurbarti" },
				headRefName: "feat/auth",
				baseRefName: "main",
				additions: 12,
				deletions: 5,
				files: [
					{ path: "src/auth.ts" },
					{ path: "src/middleware.ts" },
					{ path: "tests/auth.spec.ts" },
				],
				mergedAt: "2025-04-10T12:00:00Z",
				mergedBy: { login: "reviewer" },
				mergeable: "MERGEABLE",
				statusCheckRollup: [{ state: "SUCCESS" }],
				body: "This PR fixes the auth middleware to handle edge cases.",
			};

			const result = formatPRView(data);

			expect(result).toContain("PR #42: Fix auth middleware");
			expect(result).toContain("MERGED");
			expect(result).toContain("feat/auth");
			expect(result).toContain("main");
			expect(result).toContain("+12");
			expect(result).toContain("-5");
			expect(result).toContain("3 files");
		});

		it("handles PR with no merge info", () => {
			const data = {
				number: 41,
				title: "Add rate limiting",
				state: "OPEN",
				author: { login: "octocat" },
				headRefName: "feat/rate",
				baseRefName: "main",
				additions: 100,
				deletions: 20,
				files: [{ path: "src/rate.ts" }],
				mergedAt: null,
				mergedBy: null,
				mergeable: "MERGEABLE",
				statusCheckRollup: [],
				body: "Adds rate limiting support.",
			};

			const result = formatPRView(data);

			expect(result).toContain("PR #41: Add rate limiting");
			expect(result).toContain("OPEN");
			expect(result).not.toContain("null");
		});
	});

	describe("formatIssueList", () => {
		it("formats a list of issues as compact lines", () => {
			const data = [
				{
					number: 15,
					title: "Bug: login fails on Safari",
					state: "OPEN",
					author: { login: "user123" },
					labels: [{ name: "bug" }, { name: "frontend" }],
					updatedAt: "2025-04-10T12:00:00Z",
				},
				{
					number: 14,
					title: "Add dark mode support",
					state: "OPEN",
					author: { login: "user456" },
					labels: [{ name: "enhancement" }],
					updatedAt: "2025-04-09T08:30:00Z",
				},
			];

			const result = formatIssueList(data);

			expect(result).toContain("#15");
			expect(result).toContain("Bug: login fails on Safari");
			expect(result).toContain("bug,frontend");
			expect(result).toContain("#14");
		});

		it("returns 'No issues found.' for empty list", () => {
			expect(formatIssueList([])).toBe("No issues found.");
		});
	});

	describe("formatIssueView", () => {
		it("formats a single issue as a compact summary", () => {
			const data = {
				number: 15,
				title: "Bug: login fails on Safari",
				state: "OPEN",
				author: { login: "user123" },
				labels: [{ name: "bug" }, { name: "frontend" }],
				assignees: [{ login: "monsieurbarti" }],
				createdAt: "2025-04-10T12:00:00Z",
				body: "Login fails when using Safari 17.x on macOS.",
				comments: [{ body: "Can reproduce" }, { body: "Looking into it" }],
			};

			const result = formatIssueView(data);

			expect(result).toContain("Issue #15: Bug: login fails on Safari");
			expect(result).toContain("OPEN");
			expect(result).toContain("bug, frontend");
			expect(result).toContain("monsieurbarti");
			expect(result).toContain("2 comments");
		});

		it("handles issue with no labels or assignees", () => {
			const data = {
				number: 10,
				title: "Simple issue",
				state: "CLOSED",
				author: { login: "user" },
				labels: [],
				assignees: [],
				createdAt: "2025-04-01T00:00:00Z",
				body: "",
				comments: [],
			};

			const result = formatIssueView(data);

			expect(result).toContain("Issue #10: Simple issue");
			expect(result).toContain("CLOSED");
		});
	});
});
