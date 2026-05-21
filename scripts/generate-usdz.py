import os
import struct
import binascii
import shutil
from PIL import Image, ImageDraw

def create_crate_side_texture(filename):
    """Generates the high-fidelity crate side texture with alpha cutout."""
    # Size: 1024x1024
    img = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Draw lattice grid pattern first
    # Drawing crossing lines representing plastic ribs
    grid_color = (25, 25, 25, 255)
    line_width = 16
    spacing = 64
    
    # Draw diagonals from top-left to bottom-right
    for offset in range(-1024, 1024, spacing):
        draw.line([offset, 0, offset + 1024, 1024], fill=grid_color, width=line_width)
        
    # Draw diagonals from top-right to bottom-left
    for offset in range(0, 2048, spacing):
        draw.line([offset, 0, offset - 1024, 1024], fill=grid_color, width=line_width)

    # 2. Overwrite solid border/structure areas
    dark_plastic = (20, 20, 20, 255)
    accent_plastic = (32, 32, 32, 255)
    shadow_plastic = (8, 8, 8, 255)
    
    # Top Rim
    draw.rectangle([0, 0, 1024, 60], fill=dark_plastic)
    # Bottom Rim
    draw.rectangle([0, 964, 1024, 1024], fill=dark_plastic)
    # Left Pillar
    draw.rectangle([0, 0, 60, 1024], fill=accent_plastic)
    # Right Pillar
    draw.rectangle([964, 0, 1024, 1024], fill=accent_plastic)
    
    # Add vertical rib lines to corner pillars
    for x in range(12, 48, 12):
        draw.line([x, 0, x, 1024], fill=shadow_plastic, width=4)
    for x in range(976, 1012, 12):
        draw.line([x, 0, x, 1024], fill=shadow_plastic, width=4)

    # Top Rib cutouts (row of horizontal slots)
    # We clear slots in the rim area (say Y=65 to Y=95)
    draw.rectangle([60, 60, 964, 120], fill=dark_plastic)
    slot_color = (0, 0, 0, 0)
    for x in range(80, 940, 40):
        draw.rounded_rectangle([x, 70, x + 24, 98], radius=4, fill=slot_color)

    # 3. Middle Handle Bar & Cutout
    # Draw solid horizontal middle bar
    draw.rectangle([60, 120, 964, 250], fill=dark_plastic)
    # Highlight band above handle
    draw.rectangle([60, 120, 964, 128], fill=accent_plastic)
    
    # Cutout the handle (rounded rect in the middle of the handle bar)
    # Center X = 512, Y = 185
    draw.rounded_rectangle([320, 145, 704, 225], radius=40, fill=(0, 0, 0, 0))
    # Border rim for the handle
    draw.rounded_rectangle([316, 141, 708, 229], radius=44, outline=accent_plastic, width=5)

    # 4. Store barcode sticker on bottom left
    sticker = Image.new("RGBA", (220, 75), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(sticker)
    s_draw.rectangle([0, 0, 220, 75], fill=(244, 244, 238, 255))
    
    # Draw barcode lines
    import random
    random.seed(42) # Deterministic barcode
    x = 12
    while x < 208:
        w = random.choice([2, 4, 6])
        s_draw.rectangle([x, 8, x + w, 42], fill=(20, 20, 20, 255))
        x += w + random.choice([2, 4])
        
    # Draw barcode text
    try:
        s_draw.text((12, 48), "LP CRATE NO. 12", fill=(80, 80, 80, 255))
    except Exception:
        s_draw.rectangle([12, 48, 140, 52], fill=(80, 80, 80, 255))
        s_draw.rectangle([12, 56, 100, 60], fill=(80, 80, 80, 255))
        
    # Rotate sticker slightly (-1.8 degrees)
    rotated_sticker = sticker.rotate(-1.8, resample=Image.BICUBIC, expand=True)
    
    # Paste onto bottom-left of the crate side (above the bottom rim)
    img.paste(rotated_sticker, (100, 850), rotated_sticker)

    # Save texture
    img.save(filename, "PNG")
    print(f"Generated side texture: {filename}")

def create_crate_bottom_texture(filename):
    """Generates the crate bottom grid texture."""
    img = Image.new("RGBA", (512, 512), (18, 18, 18, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw grid lines representing reinforcing ribs
    grid_color = (28, 28, 28, 255)
    for coord in range(0, 512, 32):
        draw.line([coord, 0, coord, 512], fill=grid_color, width=4)
        draw.line([0, coord, 512, coord], fill=grid_color, width=4)
        
    img.save(filename, "PNG")
    print(f"Generated bottom texture: {filename}")

class AlignedZipWriter:
    """Manages writing a ZIP archive with strict 64-byte file data alignment for USDZ."""
    def __init__(self, filename):
        self.filename = filename
        self.fp = open(filename, 'wb')
        self.files = []
        self.offset = 0

    def add_file(self, src_path, arc_name):
        with open(src_path, 'rb') as f:
            data = f.read()

        # Compute CRC32
        crc = binascii.crc32(data) & 0xffffffff
        size = len(data)
        
        # Local Header structure size without name/extra is 30 bytes
        filename_bytes = arc_name.encode('utf-8')
        name_len = len(filename_bytes)
        
        # Align data offset in zip:
        # current_offset + 30 + name_len + extra_len MUST be multiple of 64.
        offset_without_extra = self.offset + 30 + name_len
        extra_len = (64 - (offset_without_extra % 64)) % 64
        
        # Zip extra field standard requires at least 4 bytes if present (Header ID + Data Size)
        # If calculation is less than 4, add 64 to pad further.
        if 0 < extra_len < 4:
            extra_len += 64
            
        extra = b''
        if extra_len >= 4:
            # Header ID (0x0000 = padding block), Data Size = extra_len - 4, followed by zeros
            extra = struct.pack('<HH', 0x0000, extra_len - 4) + b'\x00' * (extra_len - 4)

        # Write Local File Header
        local_header = struct.pack(
            '<IHHHHHIIIHH',
            0x04034b50,       # Signature
            10,               # Version needed (1.0)
            0,                # General purpose flags
            0,                # Compression method (stored)
            0, 0,             # Mod time & date
            crc,
            size,             # Compressed size
            size,             # Uncompressed size
            name_len,
            len(extra)
        )
        
        local_header_offset = self.offset
        
        self.fp.write(local_header)
        self.fp.write(filename_bytes)
        self.fp.write(extra)
        
        # Now write data (should start at 64-byte boundary)
        data_offset = self.fp.tell()
        assert data_offset % 64 == 0, f"Error: Data offset {data_offset} is not 64-byte aligned!"
        
        self.fp.write(data)
        
        # Save record for central directory
        self.files.append({
            'name': arc_name,
            'crc': crc,
            'size': size,
            'local_offset': local_header_offset,
        })
        
        self.offset = self.fp.tell()
        print(f"Aligned and added: {arc_name} (data start: {data_offset})")

    def close(self):
        # Write Central Directory
        cd_start_offset = self.offset
        
        for file in self.files:
            filename_bytes = file['name'].encode('utf-8')
            cd_header = struct.pack(
                '<IHHHHHHIIIHHHHHII',
                0x02014b50,          # Signature
                20,                  # Version made by (2.0)
                10,                  # Version needed (1.0)
                0,                   # General purpose flags
                0,                   # Compression method
                0, 0,                # Mod time & date
                file['crc'],
                file['size'],        # Compressed size
                file['size'],        # Uncompressed size
                len(filename_bytes),
                0,                   # Extra field len
                0,                   # Comment len
                0,                   # Disk number start
                0,                   # Internal file attrs
                0,                   # External file attrs
                file['local_offset'] # Local file header offset
            )
            self.fp.write(cd_header)
            self.fp.write(filename_bytes)
            
        cd_end_offset = self.fp.tell()
        cd_size = cd_end_offset - cd_start_offset
        
        # Write End of Central Directory
        eocd = struct.pack(
            '<IHHHHIIH',
            0x06054b50,        # Signature
            0,                 # Disk number
            0,                 # Disk with CD
            len(self.files),   # Entries on this disk
            len(self.files),   # Total entries
            cd_size,
            cd_start_offset,
            0                  # Comment len
        )
        self.fp.write(eocd)
        self.fp.close()
        print("USDZ file packaged and finalized successfully.")

def build_usdz_scene():
    temp_dir = "temp_usdz"
    os.makedirs(temp_dir, exist_ok=True)
    
    # 1. Generate textures
    create_crate_side_texture(os.path.join(temp_dir, "crate_side_texture.png"))
    create_crate_bottom_texture(os.path.join(temp_dir, "crate_bottom_texture.png"))
    
    # 2. Collect album covers and resize/convert
    covers = [
        "assets/audio/Suge White Presents Jadakiss & Styles P - Brothers-2012-MIXFIEND/Cover.jpg",
        "assets/audio/Kendrick Lamar-Section.80/extracted_cover.jpg",
        "assets/audio/Fabolous - There Is No Competition Death Comes In (DatPiff.com)/Fabolous_There_Is_No_Competition_Death_Comes_In_3-front-large.jpg",
        "assets/audio/Fabolous - The Soul Tape 2-2012-MIXFIEND/Cover.jpg",
        "svg_fallback", # J Dilla SVG
        "assets/audio/Kendrick Lamar– Good Kid M.A.A.D City- (Deluxe Edition)- [2012]/Kendrick Lamar – Good Kid M.A.A.D City 2012 front.jpg",
        "assets/audio/Ghostface Killah - Ironman/Ghostface Killah - Ironman.jpg"
    ]
    
    for i, path in enumerate(covers):
        out_name = f"cover_{i}.jpg"
        out_path = os.path.join(temp_dir, out_name)
        if path == "svg_fallback":
            # Generate custom pillow cover for J Dilla
            sleeve = Image.new("RGB", (512, 512), (180, 40, 40))
            draw = ImageDraw.Draw(sleeve)
            draw.rectangle([20, 20, 492, 492], outline=(240, 200, 80), width=10)
            try:
                draw.text((80, 180), "J DILLA", fill=(255, 255, 255))
                draw.text((80, 260), "RUFF DRAFT", fill=(240, 200, 80))
            except Exception:
                draw.rectangle([80, 180, 400, 210], fill=(255, 255, 255))
                draw.rectangle([80, 260, 430, 290], fill=(240, 200, 80))
            sleeve.save(out_path, "JPEG")
            print(f"Created J Dilla fallback cover: {out_path}")
        else:
            if os.path.exists(path):
                img = Image.open(path).convert("RGB")
                img = img.resize((512, 512), Image.Resampling.LANCZOS)
                img.save(out_path, "JPEG")
                print(f"Resized and copied: {path} -> {out_path}")
            else:
                # Fallback solid color cover if missing
                sleeve = Image.new("RGB", (512, 512), (50, 50, 80))
                draw = ImageDraw.Draw(sleeve)
                draw.rectangle([20, 20, 492, 492], outline=(200, 200, 200), width=5)
                sleeve.save(out_path, "JPEG")
                print(f"Fallback cover generated for missing file: {path}")

    # 3. Build the crate.usda scene text
    usda_header = """#usda 1.0
(
    defaultPrim = "MilkCrateScene"
    metersPerUnit = 1.0
    upAxis = "Y"
)

def Xform "MilkCrateScene"
{
    def Scope "Materials"
    {
        def Material "CrateMaterial"
        {
            token outputs:surface.connect = </MilkCrateScene/Materials/CrateMaterial/PBRShader.outputs:surface>

            def Shader "PBRShader"
            {
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor.connect = </MilkCrateScene/Materials/CrateMaterial/TextureReader.outputs:rgb>
                float inputs:opacity.connect = </MilkCrateScene/Materials/CrateMaterial/TextureReader.outputs:a>
                float inputs:opacityThreshold = 0.5
                float inputs:roughness = 0.5
                float inputs:metallic = 0.1
            }

            def Shader "TextureReader"
            {
                uniform token info:id = "UsdUVTexture"
                asset inputs:file = @crate_side_texture.png@
                float2 inputs:st.connect = </MilkCrateScene/Materials/CrateMaterial/UVReader.outputs:result>
                token outputs:rgb
                token outputs:a
            }

            def Shader "UVReader"
            {
                uniform token info:id = "UsdPrimvarReader_float2"
                string inputs:varname = "st"
                float2 outputs:result
            }
        }

        def Material "BottomMaterial"
        {
            token outputs:surface.connect = </MilkCrateScene/Materials/BottomMaterial/PBRShader.outputs:surface>

            def Shader "PBRShader"
            {
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor.connect = </MilkCrateScene/Materials/BottomMaterial/TextureReader.outputs:rgb>
                float inputs:roughness = 0.7
                float inputs:metallic = 0.0
            }

            def Shader "TextureReader"
            {
                uniform token info:id = "UsdUVTexture"
                asset inputs:file = @crate_bottom_texture.png@
                float2 inputs:st.connect = </MilkCrateScene/Materials/BottomMaterial/UVReader.outputs:result>
                token outputs:rgb
            }

            def Shader "UVReader"
            {
                uniform token info:id = "UsdPrimvarReader_float2"
                string inputs:varname = "st"
                float2 outputs:result
            }
        }

        def Material "RecordBackMaterial"
        {
            token outputs:surface.connect = </MilkCrateScene/Materials/RecordBackMaterial/PBRShader.outputs:surface>

            def Shader "PBRShader"
            {
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor = (0.12, 0.12, 0.12)
                float inputs:roughness = 0.8
                float inputs:metallic = 0.0
            }
        }
"""

    usda_materials = ""
    for i in range(len(covers)):
        usda_materials += f"""
        def Material "RecordMaterial_{i}"
        {{
            token outputs:surface.connect = </MilkCrateScene/Materials/RecordMaterial_{i}/PBRShader.outputs:surface>

            def Shader "PBRShader"
            {{
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor.connect = </MilkCrateScene/Materials/RecordMaterial_{i}/TextureReader.outputs:rgb>
                float inputs:roughness = 0.6
                float inputs:metallic = 0.0
            }}

            def Shader "TextureReader"
            {{
                uniform token info:id = "UsdUVTexture"
                asset inputs:file = @cover_{i}.jpg@
                float2 inputs:st.connect = </MilkCrateScene/Materials/RecordMaterial_{i}/UVReader.outputs:result>
                token outputs:rgb
            }}

            def Shader "UVReader"
            {{
                uniform token info:id = "UsdPrimvarReader_float2"
                string inputs:varname = "st"
                float2 outputs:result
            }}
        }}
"""

    usda_geom_crate = """
    }

    # Crate Mesh Geometry
    def Xform "Crate"
    {
        def Mesh "FrontWall" (
            prepend apiSchemas = ["MaterialBindingAPI"]
        )
        {
            int[] faceVertexCounts = [4]
            int[] faceVertexIndices = [0, 1, 2, 3]
            point3f[] points = [(-0.175, 0.0, 0.175), (0.175, 0.0, 0.175), (0.175, 0.3, 0.175), (-0.175, 0.3, 0.175)]
            bool doubleSided = true
            rel material:binding = </MilkCrateScene/Materials/CrateMaterial>
            float2[] primvars:st = [(0, 0), (1, 0), (1, 1), (0, 1)] (
                interpolation = "faceVarying"
            )
        }

        def Mesh "BackWall" (
            prepend apiSchemas = ["MaterialBindingAPI"]
        )
        {
            int[] faceVertexCounts = [4]
            int[] faceVertexIndices = [0, 1, 2, 3]
            point3f[] points = [(0.175, 0.0, -0.175), (-0.175, 0.0, -0.175), (-0.175, 0.3, -0.175), (0.175, 0.3, -0.175)]
            bool doubleSided = true
            rel material:binding = </MilkCrateScene/Materials/CrateMaterial>
            float2[] primvars:st = [(0, 0), (1, 0), (1, 1), (0, 1)] (
                interpolation = "faceVarying"
            )
        }

        def Mesh "LeftWall" (
            prepend apiSchemas = ["MaterialBindingAPI"]
        )
        {
            int[] faceVertexCounts = [4]
            int[] faceVertexIndices = [0, 1, 2, 3]
            point3f[] points = [(-0.175, 0.0, -0.175), (-0.175, 0.0, 0.175), (-0.175, 0.3, 0.175), (-0.175, 0.3, -0.175)]
            bool doubleSided = true
            rel material:binding = </MilkCrateScene/Materials/CrateMaterial>
            float2[] primvars:st = [(0, 0), (1, 0), (1, 1), (0, 1)] (
                interpolation = "faceVarying"
            )
        }

        def Mesh "RightWall" (
            prepend apiSchemas = ["MaterialBindingAPI"]
        )
        {
            int[] faceVertexCounts = [4]
            int[] faceVertexIndices = [0, 1, 2, 3]
            point3f[] points = [(0.175, 0.0, 0.175), (0.175, 0.0, -0.175), (0.175, 0.3, -0.175), (0.175, 0.3, 0.175)]
            bool doubleSided = true
            rel material:binding = </MilkCrateScene/Materials/CrateMaterial>
            float2[] primvars:st = [(0, 0), (1, 0), (1, 1), (0, 1)] (
                interpolation = "faceVarying"
            )
        }

        def Mesh "BottomWall" (
            prepend apiSchemas = ["MaterialBindingAPI"]
        )
        {
            int[] faceVertexCounts = [4]
            int[] faceVertexIndices = [0, 1, 2, 3]
            point3f[] points = [(-0.175, 0.0, -0.175), (0.175, 0.0, -0.175), (0.175, 0.0, 0.175), (-0.175, 0.0, 0.175)]
            bool doubleSided = true
            rel material:binding = </MilkCrateScene/Materials/BottomMaterial>
            float2[] primvars:st = [(0, 0), (1, 0), (1, 1), (0, 1)] (
                interpolation = "faceVarying"
            )
        }
    }
"""

    usda_geom_records = ""
    # Position records from Z = -0.12 to Z = 0.12 with slight rotation tilts
    tilts = [-9, -6, -3, 0, 3, 6, 9]
    for i in range(len(covers)):
        z_pos = -0.12 + (i * 0.04)
        usda_geom_records += f"""
    def Xform "Record_{i}"
    {{
        float3 xformOp:translate = (0.0, 0.015, {z_pos:.3f})
        float3 xformOp:rotateXYZ = ({tilts[i]}, 0, 0)
        uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:rotateXYZ"]

        def Mesh "Front" (
            prepend apiSchemas = ["MaterialBindingAPI"]
        )
        {{
            int[] faceVertexCounts = [4]
            int[] faceVertexIndices = [0, 1, 2, 3]
            point3f[] points = [(-0.15, 0.0, 0.001), (0.15, 0.0, 0.001), (0.15, 0.3, 0.001), (-0.15, 0.3, 0.001)]
            bool doubleSided = true
            rel material:binding = </MilkCrateScene/Materials/RecordMaterial_{i}>
            float2[] primvars:st = [(0, 0), (1, 0), (1, 1), (0, 1)] (
                interpolation = "faceVarying"
            )
        }}

        def Mesh "Back" (
            prepend apiSchemas = ["MaterialBindingAPI"]
        )
        {{
            int[] faceVertexCounts = [4]
            int[] faceVertexIndices = [0, 1, 2, 3]
            point3f[] points = [(-0.15, 0.0, -0.001), (0.15, 0.0, -0.001), (0.15, 0.3, -0.001), (-0.15, 0.3, -0.001)]
            bool doubleSided = true
            rel material:binding = </MilkCrateScene/Materials/RecordBackMaterial>
            float2[] primvars:st = [(1, 0), (0, 0), (0, 1), (1, 1)] (
                interpolation = "faceVarying"
            )
        }}
    }}
"""

    usda_footer = "\n}\n"

    usda_content = usda_header + usda_materials + usda_geom_crate + usda_geom_records + usda_footer
    
    usda_path = os.path.join(temp_dir, "crate.usda")
    with open(usda_path, "w") as f:
        f.write(usda_content)
    print(f"Generated scene description: {usda_path}")

    # 4. Compile to USDZ with 64-byte alignment
    output_usdz = "milk_crate.usdz"
    writer = AlignedZipWriter(output_usdz)
    
    # The USD file MUST be the first file in the ZIP archive
    writer.add_file(os.path.join(temp_dir, "crate.usda"), "crate.usda")
    
    # Add textures and other assets
    writer.add_file(os.path.join(temp_dir, "crate_side_texture.png"), "crate_side_texture.png")
    writer.add_file(os.path.join(temp_dir, "crate_bottom_texture.png"), "crate_bottom_texture.png")
    
    for i in range(len(covers)):
        writer.add_file(os.path.join(temp_dir, f"cover_{i}.jpg"), f"cover_{i}.jpg")
        
    writer.close()
    
    # Cleanup temp directory
    shutil.rmtree(temp_dir)
    print(f"Pruned temporary files. Finished: {output_usdz}")

if __name__ == "__main__":
    build_usdz_scene()
