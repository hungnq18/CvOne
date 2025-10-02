import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
const PDFDocument = require("pdfkit");

@Injectable()
export class CvPdfCloudService {
    private readonly logger = new Logger(CvPdfCloudService.name);
    private fonts = {
        regular: "Helvetica",
        bold: "Helvetica-Bold",
        italic: "Helvetica-Oblique",
    };

    private getFontDir(): string {
        const distFonts = path.join(__dirname, "../assets/fonts");
        const srcFonts = path.join(process.cwd(), "src/assets/fonts");
        if (fs.existsSync(distFonts)) return distFonts;
        if (fs.existsSync(srcFonts)) return srcFonts;
        const altSrcFonts = path.join(__dirname, "../../assets/fonts");
        if (fs.existsSync(altSrcFonts)) return altSrcFonts;
        throw new Error(
            `Font directory not found. Checked: ${distFonts} and ${srcFonts}`,
        );
    }

    /**
     * Generate a PDF Buffer from Cv document content only (no AI/job analysis)
     */
    async generatePdfBufferFromCv(cv: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const { PassThrough } = require("stream");
                const doc = new PDFDocument({
                    size: "A4",
                    margins: { top: 50, bottom: 50, left: 50, right: 50 },
                });

                // Register fonts (fallback to built-in Helvetica family on failure)
                try {
                    const fontDir = this.getFontDir();
                    doc.registerFont("Roboto", path.join(fontDir, "Roboto-Regular.ttf"));
                    doc.registerFont(
                        "Roboto-Bold",
                        path.join(fontDir, "Roboto-Bold.ttf"),
                    );
                    doc.registerFont(
                        "Roboto-Italic",
                        path.join(fontDir, "Roboto-Italic.ttf"),
                    );
                    this.fonts = {
                        regular: "Roboto",
                        bold: "Roboto-Bold",
                        italic: "Roboto-Italic",
                    };
                } catch (e) {
                    this.logger.warn(
                        `Using built-in fonts (Helvetica) due to font registration error: ${e?.message || e}`,
                    );
                    this.fonts = {
                        regular: "Helvetica",
                        bold: "Helvetica-Bold",
                        italic: "Helvetica-Oblique",
                    };
                }

                const bufferChunks: Buffer[] = [];
                const passthrough = new PassThrough();
                doc.pipe(passthrough);
                passthrough.on("data", (chunk: Buffer) => bufferChunks.push(chunk));
                passthrough.on("end", () => resolve(Buffer.concat(bufferChunks)));
                passthrough.on("error", (err: any) => reject(err));

                const user = cv?.content?.userData || {};

                // Header
                this.addHeader(doc, {
                    name:
                        this.safeText(
                            `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                        ) || "Your Name",
                    email: this.safeText(user.email),
                    phone: this.safeText(user.phone),
                    location: this.safeText(
                        [user.city, user.country].filter(Boolean).join(", "),
                    ),
                    professional: this.safeText(user.professional),
                });

                // Summary
                if (this.safeText(user.summary)) {
                    this.addSection(
                        doc,
                        "Professional Summary",
                        this.safeText(user.summary),
                    );
                }

                // Skills
                if (Array.isArray(user.skills)) {
                    this.addSkillsSection(
                        doc,
                        user.skills.map((s: any) => ({
                            name: this.safeText(s?.name),
                            rating: typeof s?.rating === "number" ? s.rating : undefined,
                        })),
                    );
                }

                // Work Experience
                if (Array.isArray(user.workHistory)) {
                    this.addWorkExperienceSection(
                        doc,
                        user.workHistory.map((w: any) => ({
                            title: this.safeText(w?.title),
                            company: this.safeText(w?.company),
                            startDate: this.safeText(w?.startDate),
                            endDate: this.safeText(w?.endDate),
                            description: this.safeText(w?.description),
                        })),
                    );
                }

                // Education
                if (Array.isArray(user.education)) {
                    this.addEducationSection(
                        doc,
                        user.education.map((e: any) => ({
                            degree: this.safeText(e?.degree),
                            major: this.safeText(e?.major),
                            institution: this.safeText(e?.institution),
                            startDate: this.safeText(e?.startDate),
                            endDate: this.safeText(e?.endDate),
                        })),
                    );
                }

                doc.end();
            } catch (error) {
                this.logger.error(
                    `Error generating CV PDF buffer: ${error?.message || error}`,
                );
                reject(error);
            }
        });
    }

    private safeText(value: any): string {
        if (value === null || value === undefined) return "";
        if (typeof value === "string") return value;
        try {
            return String(value);
        } catch {
            return "";
        }
    }

    private addHeader(doc: PDFKit.PDFDocument, personalInfo: any) {
        doc
            .fontSize(24)
            .font(this.fonts.bold)
            .text(this.safeText(personalInfo.name) || "Your Name", {
                align: "center",
            });

        doc.moveDown(0.3);

        if (this.safeText(personalInfo.professional)) {
            doc
                .fontSize(16)
                .font(this.fonts.italic)
                .text(this.safeText(personalInfo.professional), { align: "center" });
            doc.moveDown(0.5);
        }

        if (this.safeText(personalInfo.email)) {
            doc
                .fontSize(12)
                .font(this.fonts.regular)
                .text(`${this.safeText(personalInfo.email)}`, { align: "center" });
        }

        const contactLine = [
            this.safeText(personalInfo.phone),
            this.safeText(personalInfo.location),
        ]
            .filter(Boolean)
            .join(" | ");
        if (contactLine) {
            doc
                .fontSize(12)
                .font(this.fonts.regular)
                .text(contactLine, { align: "center" });
        }

        doc.moveDown(2);
    }

    private addSection(doc: PDFKit.PDFDocument, title: string, content: string) {
        doc.fontSize(16).font(this.fonts.bold).text(title);
        doc.moveDown(0.5);
        doc
            .fontSize(12)
            .font(this.fonts.regular)
            .text(this.safeText(content), { align: "justify" });
        doc.moveDown(1);
    }

    private addSkillsSection(
        doc: PDFKit.PDFDocument,
        skills: Array<{ name: string; rating: number }>,
    ) {
        doc.fontSize(16).font(this.fonts.bold).text("Skills");
        doc.moveDown(0.5);
        if (skills && skills.length > 0) {
            const skillsPerRow = 3;
            let currentRow: string[] = [];
            skills.forEach((skill, index) => {
                const name = this.safeText(skill?.name);
                const rating =
                    typeof skill?.rating === "number" ? ` (${skill.rating}/5)` : "";
                currentRow.push(`${name}${rating}`);
                if (currentRow.length === skillsPerRow || index === skills.length - 1) {
                    doc
                        .fontSize(12)
                        .font(this.fonts.regular)
                        .text(currentRow.join(" • "));
                    currentRow = [];
                }
            });
        } else {
            doc.fontSize(12).font(this.fonts.regular).text("No skills listed");
        }
        doc.moveDown(1);
    }

    private addWorkExperienceSection(doc: PDFKit.PDFDocument, work: Array<any>) {
        doc.fontSize(16).font(this.fonts.bold).text("Work Experience");
        doc.moveDown(0.5);
        if (work && work.length > 0) {
            work.forEach((job, index) => {
                doc
                    .fontSize(14)
                    .font(this.fonts.bold)
                    .text(
                        `${this.safeText(job.title)}${this.safeText(job.company) ? " at " + this.safeText(job.company) : ""}`,
                    );
                doc
                    .fontSize(12)
                    .font(this.fonts.italic)
                    .text(
                        `${this.safeText(job.startDate)} - ${this.safeText(job.endDate)}`,
                    );
                doc.moveDown(0.5);
                if (this.safeText(job.description)) {
                    doc
                        .fontSize(12)
                        .font(this.fonts.regular)
                        .text(this.safeText(job.description), { align: "justify" });
                }
                if (index < work.length - 1) doc.moveDown(1);
            });
        } else {
            doc
                .fontSize(12)
                .font(this.fonts.regular)
                .text("No work experience listed");
        }
        doc.moveDown(1);
    }

    private addEducationSection(doc: PDFKit.PDFDocument, education: Array<any>) {
        doc.fontSize(16).font(this.fonts.bold).text("Education");
        doc.moveDown(0.5);
        if (education && education.length > 0) {
            education.forEach((edu, index) => {
                doc
                    .fontSize(14)
                    .font(this.fonts.bold)
                    .text(
                        `${this.safeText(edu.degree)}${this.safeText(edu.major) ? " in " + this.safeText(edu.major) : ""}`,
                    );
                if (this.safeText(edu.institution)) {
                    doc
                        .fontSize(12)
                        .font(this.fonts.regular)
                        .text(this.safeText(edu.institution));
                }
                doc
                    .fontSize(12)
                    .font(this.fonts.italic)
                    .text(
                        `${this.safeText(edu.startDate)} - ${this.safeText(edu.endDate)}`,
                    );
                if (index < education.length - 1) doc.moveDown(0.5);
            });
        } else {
            doc.fontSize(12).font(this.fonts.regular).text("No education listed");
        }
        doc.moveDown(1);
    }
}
