dev:
	npx postcss styles/*.css autoprefixer --replace -m
	browser-sync start --server --files "styles/*.css"

postprocess:
	npx postcss styles/*.css --use autoprefixer --replace 

dist:
	npx postcss styles/*.css --use autoprefixer --replace 
