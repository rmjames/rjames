dev:
	npx postcss styles/*.css --use autoprefixer --replace --verbose
	browser-sync start --server --files "styles/*.css"

postprocess:
	npx postcss styles/*.css --use autoprefixer --replace --verbose

dist:
	npx postcss styles/*.css --use autoprefixer --replace --verbose