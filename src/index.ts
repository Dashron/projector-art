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
	let currentImage = 0;

	function loadNext() {
		let next = new Image();
		currentImage += 1;
		next.src = imgSrcs[currentImage];
	}

    let image = document.getElementById('image');
	image.src = imgSrcs[currentImage];

	// This ensures it takes 8 hours no matter how many images exist
	// const interval = ((8 * 60 * 60) / imgSrcs.length) * 1000;
	const interval = 1000;

	setInterval(() => {
		let image = document.getElementById('image');
		image.src = imgSrcs[currentImage];
		loadNext();
	}, interval);
	console.log('interval', ((8 * 60 * 60) / imgSrcs.length) * 1000);
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
			let links = [];

			for (let i = 0; i < files.length; i++) {
				links.push(`"/${req.params.folder}/${encodeURIComponent(files[i])}"`);
			}

			let response = `
			<img src="" id="image" />
			<script>
				var imgSrcs = [${links.join(', ')}];
				${scriptContents}
			</script>`

			// send the list of links
			res.send(response);
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