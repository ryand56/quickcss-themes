import * as fs from "fs";
import sass from "sass";

const compileTheme = (name, themePath, manifest) => {
    const compiled = sass.compile(themePath);
    console.log(`${name} - Compilation successful`);
    return compiled.css;
};

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
                    const manifestPath = `src/client/${item.name}/powercord_manifest.json`;
                    const themePath = `src/client/${item.name}/theme.scss`;
                    const compiledPath = `src/client/${item.name}/theme-compiled.css`;

                    fs.readFile(manifestPath, (err, manifest) => {
                        if (err) console.log("Manifest could not be found. Skipping");
                        const parsedManifest = JSON.parse(manifest);
                        
                        fs.readFile(compiledPath, (_, cached) => {
                            let compiled = compileTheme(item.name, themePath, parsedManifest);
                            const cache = cached?.toString("utf8");
                            // Check for changes
                            if (compiled === cache) {
                                console.log(`${item.name} - No changes`);
                                return;
                            }

                            console.log(`${item.name} - Changes`);
                            const date = new Date();
                            let templateString = template.toString("utf8");
                            templateString = `${templateString
                                .replace("{name}", item.name)
                                .replace("{version}", parsedManifest && parsedManifest.version ? ` v${parsedManifest.version}` : "")
                                .replace("{author}", parsedManifest && parsedManifest.author ? `${parsedManifest.author}\n` : "")
                                .replace("{date}", date.toISOString().split("T")[0])}\n\n`;
                            templateString += compiled;
                            fs.writeFileSync(`src/client/${item.name}/theme-compiled.css`, compiled);
                        });
                    });
                }
            }
        });
    });
} catch (e) {
    if (e instanceof Error) {
        console.log(e.message);
    }
}