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

const scriptContents = `
	// Ensure we sort 10 after 9, and not after 1.
	imgSrcs.sort((a,b) => (a).localeCompare(b, undefined, {numeric: true}));

	let currentImage = 0;

	// Function to preload the next image
	function loadNext() {
		let next = new Image();
		currentImage += 1;
		next.src = imgSrcs[currentImage];
	}

	// Load the first image into the background image
    let image = document.getElementById('imageback');
	image.src = imgSrcs[currentImage];

	// Preload the second image
	loadNext();

	function cycle() {
		let imageback = document.getElementById('imageback');

		// Load the foreground image
		let imagefront = new Image();
		imagefront.id = 'imagefront';
		imagefront.classList.add('fadein');
		imagefront.src = imgSrcs[currentImage];

		// When the foreground images animation is done, move it to the background, remove the foreground image and repeat the process
		imagefront.addEventListener('animationend', () => {
			imageback.src = imagefront.src;
			imagefront.remove();
			cycle();
		});

		// Add the foreground image to the page
		imageback.parentNode.insertBefore(imagefront, imageback.nextSibling);

		// Preload the next image
		loadNext();
	}

	cycle();
`;

const styleContents = `
	img {
		position: absolute;
		top: 0;
		left: 0;
	}

	#imagefront.fadein {
		--fadeInTime: 2s;

		animation: fadeIn var(--fadeInTime);
		-webkit-animation: fadeIn var(--fadeInTime);
		-moz-animation: fadeIn var(--fadeInTime);
		-o-animation: fadeIn var(--fadeInTime);
		-ms-animation: fadeIn var(--fadeInTime);
		display: block;
		z-index 5;
	}

	@keyframes fadeIn {
		0% {opacity:0;}
		100% {opacity:1;}
	}

	@-moz-keyframes fadeIn {
		0% {opacity:0;}
		100% {opacity:1;}
	}

	@-webkit-keyframes fadeIn {
		0% {opacity:0;}
		100% {opacity:1;}
	}

	@-o-keyframes fadeIn {
		0% {opacity:0;}
		100% {opacity:1;}
	}

	@-ms-keyframes fadeIn {
		0% {opacity:0;}
		100% {opacity:1;}
	}
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
			<img src="" id="imageback" />
			<script>
				var imgSrcs = [${links.join(', ')}];
				${scriptContents}
			</script>
			<style>
				${styleContents}
			</style>`

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