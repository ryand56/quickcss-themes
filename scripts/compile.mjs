import * as fs from "fs";
import sass from "sass";

const filesToCompile = process.argv.slice(2);

try {
    // Load in the template first
    fs.readFile("scripts/template.scss", (err, template) => {
        if (err) throw new Error(err.message);
        // Go through the client folder
        fs.readdir("src/client", { withFileTypes: true }, (err, items) => {
            if (err) throw new Error("Client folder does not exist.");
            for (const item of items) {
                const isDir = item.isDirectory();
                if (isDir) {
                    const manifestPath = `client/${item.name}/powercord_manifest.json`;
                    const themePath = `client/${item.name}/theme.scss`;

                    if (filesToCompile.includes(manifestPath) || filesToCompile.includes(themePath)) {
                        fs.readFile(`src/client/${item.name}/powercord_manifest.json`, (err, manifest) => {
                            if (err) console.log("Manifest could not be found. Skipping");
                            const parsedManifest = JSON.parse(manifest);
    
                            const compiled = sass.compile(`src/client/${item.name}/theme.scss`);
                            console.log(`${item.name} - Compilation successful`);
    
                            const date = new Date();
                            let templateString = template.toString("utf8");
                            templateString = `${templateString
                                .replace("{name}", item.name)
                                .replace("{version}", parsedManifest ? ` v${parsedManifest.version}` : "")
                                .replace("{date}", date.toISOString().split("T")[0])}\n\n`;
                            templateString += compiled.css;
                            fs.writeFileSync(`src/client/${item.name}/theme-compiled.css`, templateString);
                        });
                    }
                }
            }
            console.log("Done");
        });
    });
} catch (e) {
    if (e instanceof Error) {
        console.log(e.message);
    }
}