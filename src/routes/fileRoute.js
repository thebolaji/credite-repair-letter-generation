// src/routes/pdfRoute.js
const express = require("express");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");
const path = require("path");
const fs = require("fs").promises;
const router = express.Router();

// API endpoint to generate PDF
router.get("/", async (req, res) => {
  try {
    // Data to inject into the template
    const data = {
      fullName: "John Doe",
      Address: "123 Main St, New York, NY",
      SSN: "123-45-6789",
      DOB: "01/01/1980",
      bureauName: "Equifax Information Services, LLC",
      poBOX: "PO Box 740256",
      bureauAddress: "Atlanta, GA 30374-0256",
      NAME: "John Doe",
      ADDRESS: "123 Main St, New York, NY",
    };

    // Render the letter template with the layout
    const html = await renderTemplateWithLayout("letter3", data);
    // console.log(html);
    // Launch Puppeteer to generate PDF
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    const page = await browser.newPage();
    // await page.goto(url, { waitUntil: "load", timeout: 0 });

    // await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 0 });

    const byteArray = await page.pdf({
      path: "my_letter.pdf",
      format: "A4",
      // landscape: true,
      scale: 1.5,
      printBackground: true,
      margin: {
        top: "10mm", // Top margin
        right: "10mm", // Right margin
        bottom: "10mm", // Bottom margin
        left: "10mm", // Left margin
      },
    });

    const buffer = Buffer.from(byteArray, "binary");

    await browser.close();

    // Set the file for download
    res.contentType("application/pdf");
    // res.setHeader("Content-Disposition", "attachment; filename=letter.pdf");
    return res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating PDF");
  }
});

// Helper function to render Handlebars template with layout
const renderTemplateWithLayout = async (templateName, data) => {
  try {
    const layoutPath = path.join(__dirname, "../views/layout.hbs");
    const layoutContent = await fs.readFile(layoutPath, "utf8");
    const layoutTemplate = Handlebars.compile(layoutContent);

    const templatePath = path.join(
      __dirname,
      "../views",
      `${templateName}.hbs`
    );
    const templateContent = await fs.readFile(templatePath, "utf8");
    const template = Handlebars.compile(templateContent);

    // Inject the body into the layout
    const html = layoutTemplate({
      ...data,
      body: template(data),
    });
    return html;
  } catch (err) {
    throw err;
  }
};

module.exports = router;
