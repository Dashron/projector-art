import * as express from 'express';
import * as fs from 'fs';

const app = express();
const port = 8080;

/**
 * This endpoint should scan the list folders in the images directory and list them as html links
 */
app.get("/", (req, res) => {
	fs.readdir("./images", (err, files) => {
		if (err) {
			res.send("Error reading directory");
		} else {
			// build a list of links
			let links = "";
			for (let i = 0; i < files.length; i++) {
				links += `<a href="/${files[i]}">${files[i]}</a><br>`;
			}
			// send the list of links
			res.send(links);
		}
	});
});

// Make all images on the page invisible, then show the first image full screen and cycle through the images every 5 seconds
const scriptContents = `
	<script>
		document.querySelectorAll("img").forEach(img => {
			img.style.visibility = "hidden";
		});
		document.querySelector("img").style.visibility = "visible";
		setInterval(() => {
			let current = document.querySelector("img");
			let next = current.nextElementSibling;
			if (next == null) {
				next = current.parentElement.firstElementChild;
			}
			current.style.visibility = "hidden";
			next.style.visibility = "visible";
		}, 5000);
	</script>
`;

/*
 * This endpoint should return an html page containing links to all the images in the requested folder
 */
app.get("/:folder", (req, res) => {
	fs.readdir(`./images/${req.params.folder}`, (err, files) => {
		if (err) {
			res.send("Error reading file");
		} else {
			// build a list of links
			let links = "";
			for (let i = 0; i < files.length; i++) {
				links += `<img src="/${req.params.folder}/${encodeURIComponent(files[i])}" /><br>`;
			}

			links += scriptContents;
			// send the list of links
			res.send(links);
		}
	});
});

/**
 * This endpoint should return the requested image
 */
app.get("/:folder/:image", (req, res) => {
	fs.readFile(`./images/${req.params.folder}/${req.params.image}`, (err, data) => {
		if (err) {
			res.send("Error reading file");
		} else {
			// send the image
			res.send(data);
		}
	});
});

app.listen(port, () => {
	console.log('server started');
});