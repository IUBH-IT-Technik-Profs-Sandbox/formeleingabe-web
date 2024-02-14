const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const collections = require('./utils/collections.js')

module.exports = function (eleventyConfig) {
	// Folders to copy to build dir (See. 1.1)
	eleventyConfig.addPassthroughCopy("src/static");

	eleventyConfig.addNunjucksGlobal("threeEds", ()=> {
		const r = ["Mathlive","Equatio","Wiris"]
		for(let i=0; i<20; i++) {
			let a = Math.trunc(Math.random()*3), b = Math.trunc(Math.random()*3);
			if(a!==b) {
				let x = r[a]; r[a] = r[b]; r[b] = x;
			}
		}
		return r;
	})

	eleventyConfig.addNunjucksGlobal("builtAt",
		()=> {return new Date().getTime() % 1000000;})

	// Filters 
	Object.keys(filters).forEach((filterName) => {
		eleventyConfig.addFilter(filterName, filters[filterName])
	})

	// Transforms
	Object.keys(transforms).forEach((transformName) => {
		eleventyConfig.addTransform(transformName, transforms[transformName])
	})

	// Collections
	Object.keys(collections).forEach((collectionName) => {
		eleventyConfig.addCollection(collectionName, collections[collectionName])
	})

	// This allows Eleventy to watch for file changes during local development.
	eleventyConfig.setUseGitIgnore(false);

	return {
		dir: {
			input: "src/",
			output: "dist",
			includes: "_includes",
			layouts: "_layouts"
		},
		templateFormats: ["html", "md", "njk"],
		htmlTemplateEngine: "njk",

		// 1.1 Enable eleventy to pass dirs specified above
		passthroughFileCopy: true
	};
};
