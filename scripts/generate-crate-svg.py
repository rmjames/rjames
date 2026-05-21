import math
import os

def project(x, y, z, cx=400, cy=610):
    # ax: angle of X axis (right-back)
    # az: angle of Z axis (left-back)
    ax = math.radians(-32)
    az = math.radians(202)
    
    px = cx + x * math.cos(ax) + z * math.cos(az)
    py = cy - y + x * math.sin(ax) + z * math.sin(az)
    return px, py

def get_rounded_rect_points(cx, cy, w, h, r, z, is_right_face=False):
    """Generates 3D points for a rounded rectangle on front-left or right face."""
    points = []
    # 8-point approximation per corner
    steps = 6
    
    # Corners: Top-Left, Top-Right, Bottom-Right, Bottom-Left
    corners = [
        (cx - w/2 + r, cy + h/2 - r, math.pi, math.pi*1.5),      # TL
        (cx + w/2 - r, cy + h/2 - r, math.pi*1.5, math.pi*2.0),  # TR
        (cx + w/2 - r, cy - h/2 + r, 0.0, math.pi*0.5),          # BR
        (cx - w/2 + r, cy - h/2 + r, math.pi*0.5, math.pi)       # BL
    ]
    
    for x_c, y_c, a1, a2 in corners:
        for i in range(steps + 1):
            angle = a1 + (a2 - a1) * i / steps
            dx = r * math.cos(angle)
            dy = r * math.sin(angle)
            if is_right_face:
                # On right face: X is depth (front-to-back), Y is vertical, Z is constant (right wall Z=0)
                points.append((x_c + dx, y_c + dy, z))
            else:
                # On front-left face: X is constant (front wall X=0), Y is vertical, Z is width (left-to-right)
                points.append((z, y_c + dy, x_c + dx))
    return points

def generate_svg():
    os.makedirs("lab", exist_ok=True)
    
    # Crate Dimensions in 3D
    H = 250    # Height
    W = 280    # Width (Right face)
    L = 300    # Length (Front-left face)
    
    svg_lines = []
    svg_lines.append('<svg viewBox="0 0 800 800" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:transparent;">')
    
    # Add gradients and filters
    svg_lines.append("""  <defs>
    <!-- Dark plastic gradients for different faces -->
    <linearGradient id="frontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#242426" />
      <stop offset="100%" stop-color="#141415" />
    </linearGradient>
    <linearGradient id="rightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1b1b1c" />
      <stop offset="100%" stop-color="#0c0c0d" />
    </linearGradient>
    <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111112" />
      <stop offset="100%" stop-color="#080809" />
    </linearGradient>
    
    <!-- Record spine color palettes -->
    <linearGradient id="spineYellow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e8dcb9" /><stop offset="10%" stop-color="#fdf6e2" />
      <stop offset="90%" stop-color="#e5d4a4" /><stop offset="100%" stop-color="#bda773" />
    </linearGradient>
    <linearGradient id="spineRed" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#9a342b" /><stop offset="15%" stop-color="#c84b31" />
      <stop offset="85%" stop-color="#a83a24" /><stop offset="100%" stop-color="#691a11" />
    </linearGradient>
    <linearGradient id="spineBlue" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2c4c64" /><stop offset="15%" stop-color="#41729f" />
      <stop offset="85%" stop-color="#275885" /><stop offset="100%" stop-color="#14365d" />
    </linearGradient>
    <linearGradient id="spineGreen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34543d" /><stop offset="15%" stop-color="#52795d" />
      <stop offset="85%" stop-color="#3c6146" /><stop offset="100%" stop-color="#1e3a24" />
    </linearGradient>
    <linearGradient id="spineCream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e6dfd3" /><stop offset="10%" stop-color="#f5f0e6" />
      <stop offset="90%" stop-color="#dfd5c6" /><stop offset="100%" stop-color="#baa891" />
    </linearGradient>
    <linearGradient id="spineBlack" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2d2d30" /><stop offset="15%" stop-color="#424246" />
      <stop offset="85%" stop-color="#212124" /><stop offset="100%" stop-color="#111112" />
    </linearGradient>
    <linearGradient id="spineOrange" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b65a25" /><stop offset="15%" stop-color="#d97436" />
      <stop offset="85%" stop-color="#b85c26" /><stop offset="100%" stop-color="#7c3710" />
    </linearGradient>
    
    <!-- Crate drop shadow -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="10" dy="25" stdDeviation="15" flood-color="#000000" flood-opacity="0.65" />
    </filter>
  </defs>""")
  
    # 1. Shadow Under Crate
    p_bot_c = project(0, 0, 0)
    p_bot_l = project(0, 0, L)
    p_bot_r = project(W, 0, 0)
    p_bot_b = project(W, 0, L)
    
    svg_lines.append(f'  <!-- Drop Shadow Plane -->')
    svg_lines.append(f'  <polygon points="{p_bot_c[0]:.1f},{p_bot_c[1]:.1f} {p_bot_l[0]:.1f},{p_bot_l[1]:.1f} {p_bot_b[0]:.1f},{p_bot_b[1]:.1f} {p_bot_r[0]:.1f},{p_bot_r[1]:.1f}" fill="#0a0a0b" filter="url(#shadow)" opacity="0.9" />')

    # 2. Back Walls (Interior)
    p_top_c = project(0, H, 0)
    p_top_l = project(0, H, L)
    p_top_r = project(W, H, 0)
    p_top_b = project(W, H, L)
    
    svg_lines.append(f'  <!-- Inner Back Walls -->')
    # Back-Right Wall (from X=0 to X=W, Z=L)
    svg_lines.append(f'  <polygon points="{p_bot_l[0]:.1f},{p_bot_l[1]:.1f} {p_bot_b[0]:.1f},{p_bot_b[1]:.1f} {p_top_b[0]:.1f},{p_top_b[1]:.1f} {p_top_l[0]:.1f},{p_top_l[1]:.1f}" fill="url(#innerGrad)" />')
    # Back-Left Wall (from X=W to X=0, Z=0)
    svg_lines.append(f'  <polygon points="{p_bot_c[0]:.1f},{p_bot_c[1]:.1f} {p_bot_r[0]:.1f},{p_bot_r[1]:.1f} {p_top_r[0]:.1f},{p_top_r[1]:.1f} {p_top_c[0]:.1f},{p_top_c[1]:.1f}" fill="url(#innerGrad)" />')

    # 3. Records Stack (lean back slightly, standing parallel to Right Wall)
    # The stack spans Z=15 to Z=L-15.
    svg_lines.append(f'  <!-- Records Stack -->')
    import random
    random.seed(1337)
    
    spine_grads = [
        "url(#spineYellow)", "url(#spineRed)", "url(#spineBlue)", 
        "url(#spineGreen)", "url(#spineCream)", "url(#spineBlack)", "url(#spineOrange)"
    ]
    
    num_records = 65
    record_h = 245
    record_w = 265
    tilt_x = -15  # Lean towards back-right (negative X)
    
    for i in range(num_records):
        # Position z along the Z axis from back (15) to front (L - 15)
        z = 20 + (L - 40) * (i / (num_records - 1))
        # Add slight random alignment noise
        z_noise = random.uniform(-1.5, 1.5)
        z_eff = z + z_noise
        
        # Color gradient
        grad = random.choice(spine_grads)
        
        # Bottom-left (X=10, Y=5)
        bl_x = 12 + random.uniform(-1, 1)
        bl = project(bl_x, 5, z_eff)
        # Bottom-right (X=10+record_w, Y=5)
        br = project(bl_x + record_w, 5, z_eff)
        
        # Top-right (with tilt_x)
        tr = project(bl_x + record_w + tilt_x, 5 + record_h, z_eff)
        # Top-left (with tilt_x)
        tl = project(bl_x + tilt_x, 5 + record_h, z_eff)
        
        # Spine top highlight thickness
        spine_t = 3.5
        tl_sp = project(bl_x + tilt_x, 5 + record_h + spine_t, z_eff)
        tr_sp = project(bl_x + record_w + tilt_x, 5 + record_h + spine_t, z_eff)
        
        # Draw sleeve face (visible from right side since it leans back)
        svg_lines.append(f'  <!-- Record {i} -->')
        # Main cardboard sleeve face
        svg_lines.append(f'  <polygon points="{bl[0]:.1f},{bl[1]:.1f} {br[0]:.1f},{br[1]:.1f} {tr[0]:.1f},{tr[1]:.1f} {tl[0]:.1f},{tl[1]:.1f}" fill="#181819" />')
        # Colored spine (top edge)
        svg_lines.append(f'  <polygon points="{tl[0]:.1f},{tl[1]:.1f} {tr[0]:.1f},{tr[1]:.1f} {tr_sp[0]:.1f},{tr_sp[1]:.1f} {tl_sp[0]:.1f},{tl_sp[1]:.1f}" fill="{grad}" stroke="#000" stroke-width="0.3" />')
        
        # Add inner sleeve paper liner sliver (white paper peeking out)
        if random.random() > 0.4:
            pw = random.uniform(20, 80)
            px_start = bl_x + random.uniform(10, record_w - 90)
            ptl = project(px_start + tilt_x, 5 + record_h + spine_t, z_eff)
            ptr = project(px_start + pw + tilt_x, 5 + record_h + spine_t, z_eff)
            ptl_p = project(px_start + tilt_x - 2, 5 + record_h + spine_t + 5, z_eff)
            ptr_p = project(px_start + pw + tilt_x - 2, 5 + record_h + spine_t + 5, z_eff)
            svg_lines.append(f'  <polygon points="{ptl[0]:.1f},{ptl[1]:.1f} {ptr[0]:.1f},{ptr[1]:.1f} {ptr_p[0]:.1f},{ptr_p[1]:.1f} {ptl_p[0]:.1f},{ptl_p[1]:.1f}" fill="#edebe4" stroke="#cfcbbb" stroke-width="0.3" />')

    # 4. Front-Left Wall (Z=L) - contains Handle, Grid Lattice, and Label Sticker
    # To handle the cutout hole, we construct a compound path with fill-rule="evenodd"
    svg_lines.append(f'  <!-- Front-Left Wall Panel with Cutout Handle -->')
    
    # Outline vertices in clockwise order
    p_fl_bl = project(0, 0, L)
    p_fl_br = project(0, 0, 0)
    p_fl_tr = project(0, H, 0)
    p_fl_tl = project(0, H, L)
    
    # Generate points for the handle cutout in counter-clockwise order
    # Handle is centered horizontally along the face, so at Z = L/2 (Z = 150)
    # Dimensions in 3D: width = 110, height = 34, radius = 17
    # Center X = 0 (since it is on Z=L wall), Y = H - 75, Center Z = 150
    handle_points = get_rounded_rect_points(150, H - 75, 115, 34, 17, L)
    handle_points.reverse() # Reverse for counter-clockwise hole cutout
    
    path_d = f"M {p_fl_bl[0]:.1f},{p_fl_bl[1]:.1f} L {p_fl_br[0]:.1f},{p_fl_br[1]:.1f} L {p_fl_tr[0]:.1f},{p_fl_tr[1]:.1f} L {p_fl_tl[0]:.1f},{p_fl_tl[1]:.1f} Z"
    handle_d = " M " + " L ".join(f"{pt[0]:.1f},{pt[1]:.1f}" for pt in handle_points) + " Z"
    
    svg_lines.append(f'  <path d="{path_d + handle_d}" fill="url(#frontGrad)" fill-rule="evenodd" stroke="#111" stroke-width="1.0" />')
    
    # Outer highlighted frame of the handle hole
    handle_outer_points = get_rounded_rect_points(150, H - 75, 115, 34, 17, L)
    handle_outer_d = "M " + " L ".join(f"{pt[0]:.1f},{pt[1]:.1f}" for pt in handle_outer_points) + " Z"
    svg_lines.append(f'  <path d="{handle_outer_d}" fill="none" stroke="#3a3a3d" stroke-width="3" opacity="0.8" />')

    # Front Lattice Grid (Y=0 to Y=130)
    # Draw diagonal lines projected on plane X=0, Z from 0 to L
    svg_lines.append(f'  <!-- Front Lattice Ribs -->')
    grid_y_min = 10
    grid_y_max = 130
    
    # Diagonals / crossing lines
    # Z range is 0 to L. Grid spacing in 3D = 35
    for z_line in range(-150, L + 150, 35):
        # Diagonal /
        p1 = project(0, grid_y_min, z_line)
        p2 = project(0, grid_y_max, z_line + (grid_y_max - grid_y_min))
        # Clip to panel limits (Z: 15 to L-15, Y: 10 to 130)
        # For simple visual rendering, we draw paths and mask them, or compute intersections.
        # Since this is generated, we can compute clipped points:
        # z = z_line + (y - y_min)
        # We need 15 <= z <= L-15
        y_start = max(grid_y_min, grid_y_min + (15 - z_line))
        y_end = min(grid_y_max, grid_y_min + (L - 15 - z_line))
        if y_start < y_end:
            p1_c = project(0, y_start, z_line + (y_start - grid_y_min))
            p2_c = project(0, y_end, z_line + (y_end - grid_y_min))
            svg_lines.append(f'  <line x1="{p1_c[0]:.1f}" y1="{p1_c[1]:.1f}" x2="{p2_c[0]:.1f}" y2="{p2_c[1]:.1f}" stroke="#2a2a2d" stroke-width="6" stroke-linecap="round" />')
            
        # Diagonal \
        # z = z_line - (y - y_min)
        # We need 15 <= z <= L-15
        y_start_2 = max(grid_y_min, grid_y_min + (z_line - (L - 15)))
        y_end_2 = min(grid_y_max, grid_y_min + (z_line - 15))
        if y_start_2 < y_end_2:
            p1_c = project(0, y_start_2, z_line - (y_start_2 - grid_y_min))
            p2_c = project(0, y_end_2, z_line - (y_end_2 - grid_y_min))
            svg_lines.append(f'  <line x1="{p1_c[0]:.1f}" y1="{p1_c[1]:.1f}" x2="{p2_c[0]:.1f}" y2="{p2_c[1]:.1f}" stroke="#2a2a2d" stroke-width="6" stroke-linecap="round" />')

    # Front reinforcing rib borders (framing the lattice)
    p_rib_bl = project(0, 10, L - 15)
    p_rib_br = project(0, 10, 15)
    p_rib_tr = project(0, 130, 15)
    p_rib_tl = project(0, 130, L - 15)
    svg_lines.append(f'  <polygon points="{p_rib_bl[0]:.1f},{p_rib_bl[1]:.1f} {p_rib_br[0]:.1f},{p_rib_br[1]:.1f} {p_rib_tr[0]:.1f},{p_rib_tr[1]:.1f} {p_rib_tl[0]:.1f},{p_rib_tl[1]:.1f}" fill="none" stroke="#161617" stroke-width="5" />')

    # Front Top Ribslots (row of slots in Y=190 to Y=210)
    for z_slot in range(35, L - 35, 30):
        # Draw a small projected slot
        ps1 = project(0, 195, z_slot + 8)
        ps2 = project(0, 195, z_slot - 8)
        ps3 = project(0, 207, z_slot - 8)
        ps4 = project(0, 207, z_slot + 8)
        svg_lines.append(f'  <polygon points="{ps1[0]:.1f},{ps1[1]:.1f} {ps2[0]:.1f},{ps2[1]:.1f} {ps3[0]:.1f},{ps3[1]:.1f} {ps4[0]:.1f},{ps4[1]:.1f}" fill="#080809" stroke="#333" stroke-width="0.5" />')

    # Front horizontal ribbed lines
    for y_rib in [142, 154, 166, 178]:
        pr1 = project(0, y_rib, 15)
        pr2 = project(0, y_rib, L - 15)
        svg_lines.append(f'  <line x1="{pr1[0]:.1f}" y1="{pr1[1]:.1f}" x2="{pr2[0]:.1f}" y2="{pr2[1]:.1f}" stroke="#131314" stroke-width="4" />')
        svg_lines.append(f'  <line x1="{pr1[0]:.1f}" y1="{pr1[1]+1.5:.1f}" x2="{pr2[0]:.1f}" y2="{pr2[1]+1.5:.1f}" stroke="#36363a" stroke-width="1.5" opacity="0.6" />')

    # 5. Right Wall Panel (X=W) - contains Handle and Lattice
    svg_lines.append(f'  <!-- Right Wall Panel with Cutout Handle -->')
    
    p_r_bl = project(0, 0, 0)
    p_r_br = project(W, 0, 0)
    p_r_tr = project(W, H, 0)
    p_r_tl = project(0, H, 0)
    
    # Rounded handle hole on right face (X centered at W/2, Y centered at H-75, Z=0)
    # Counter-clockwise hole cutout for evenodd rule
    handle_points_r = get_rounded_rect_points(W/2, H - 75, 110, 34, 17, 0, is_right_face=True)
    handle_points_r.reverse()
    
    path_d_r = f"M {p_r_bl[0]:.1f},{p_r_bl[1]:.1f} L {p_r_br[0]:.1f},{p_r_br[1]:.1f} L {p_r_tr[0]:.1f},{p_r_tr[1]:.1f} L {p_r_tl[0]:.1f},{p_r_tl[1]:.1f} Z"
    handle_d_r = " M " + " L ".join(f"{pt[0]:.1f},{pt[1]:.1f}" for pt in handle_points_r) + " Z"
    
    svg_lines.append(f'  <path d="{path_d_r + handle_d_r}" fill="url(#rightGrad)" fill-rule="evenodd" stroke="#080809" stroke-width="1.0" />')
    
    # Outer highlighted frame of the right handle hole
    handle_outer_points_r = get_rounded_rect_points(W/2, H - 75, 110, 34, 17, 0, is_right_face=True)
    handle_outer_d_r = "M " + " L ".join(f"{pt[0]:.1f},{pt[1]:.1f}" for pt in handle_outer_points_r) + " Z"
    svg_lines.append(f'  <path d="{handle_outer_d_r}" fill="none" stroke="#2c2c2f" stroke-width="3" opacity="0.6" />')

    # Right Lattice Grid (Y=0 to Y=130)
    svg_lines.append(f'  <!-- Right Lattice Ribs -->')
    # Draw diagonal lines projected on plane Z=0, X from 0 to W
    for x_line in range(-150, W + 150, 35):
        # Diagonal /
        # x_p = x_line + (y - y_min)
        # We need 15 <= x_p <= W-15
        y_start = max(grid_y_min, grid_y_min + (15 - x_line))
        y_end = min(grid_y_max, grid_y_min + (W - 15 - x_line))
        if y_start < y_end:
            p1_c = project(x_line + (y_start - grid_y_min), y_start, 0)
            p2_c = project(x_line + (y_end - grid_y_min), y_end, 0)
            svg_lines.append(f'  <line x1="{p1_c[0]:.1f}" y1="{p1_c[1]:.1f}" x2="{p2_c[0]:.1f}" y2="{p2_c[1]:.1f}" stroke="#212124" stroke-width="5" stroke-linecap="round" />')
            
        # Diagonal \
        # x_p = x_line - (y - y_min)
        # We need 15 <= x_p <= W-15
        y_start_2 = max(grid_y_min, grid_y_min + (x_line - (W - 15)))
        y_end_2 = min(grid_y_max, grid_y_min + (x_line - 15))
        if y_start_2 < y_end_2:
            p1_c = project(x_line - (y_start_2 - grid_y_min), y_start_2, 0)
            p2_c = project(x_line - (y_end_2 - grid_y_min), y_end_2, 0)
            svg_lines.append(f'  <line x1="{p1_c[0]:.1f}" y1="{p1_c[1]:.1f}" x2="{p2_c[0]:.1f}" y2="{p2_c[1]:.1f}" stroke="#212124" stroke-width="5" stroke-linecap="round" />')

    # Right reinforcing rib borders
    p_rib_bl_r = project(15, 10, 0)
    p_rib_br_r = project(W - 15, 10, 0)
    p_rib_tr_r = project(W - 15, 130, 0)
    p_rib_tl_r = project(15, 130, 0)
    svg_lines.append(f'  <polygon points="{p_rib_bl_r[0]:.1f},{p_rib_bl_r[1]:.1f} {p_rib_br_r[0]:.1f},{p_rib_br_r[1]:.1f} {p_rib_tr_r[0]:.1f},{p_rib_tr_r[1]:.1f} {p_rib_tl_r[0]:.1f},{p_rib_tl_r[1]:.1f}" fill="none" stroke="#0f0f10" stroke-width="5" />')

    # Right Top Ribslots (row of slots in Y=190 to Y=210)
    for x_slot in range(35, W - 35, 30):
        ps1 = project(x_slot + 8, 195, 0)
        ps2 = project(x_slot - 8, 195, 0)
        ps3 = project(x_slot - 8, 207, 0)
        ps4 = project(x_slot + 8, 207, 0)
        svg_lines.append(f'  <polygon points="{ps1[0]:.1f},{ps1[1]:.1f} {ps2[0]:.1f},{ps2[1]:.1f} {ps3[0]:.1f},{ps3[1]:.1f} {ps4[0]:.1f},{ps4[1]:.1f}" fill="#050506" stroke="#252528" stroke-width="0.5" />')

    # Right horizontal ribbed lines
    for y_rib in [142, 154, 166, 178]:
        pr1 = project(15, y_rib, 0)
        pr2 = project(W - 15, y_rib, 0)
        svg_lines.append(f'  <line x1="{pr1[0]:.1f}" y1="{pr1[1]:.1f}" x2="{pr2[0]:.1f}" y2="{pr2[1]:.1f}" stroke="#0f0f10" stroke-width="4" />')
        svg_lines.append(f'  <line x1="{pr1[0]:.1f}" y1="{pr1[1]+1.5:.1f}" x2="{pr2[0]:.1f}" y2="{pr2[1]+1.5:.1f}" stroke="#2c2c2f" stroke-width="1.5" opacity="0.4" />')

    # 6. Crate Corner Pillars (Pillars covering the vertical intersections)
    svg_lines.append(f'  <!-- Corner Pillars -->')
    
    # 6.1 Center Column Pillar (at X=0, Z=0)
    # Drawn as two thin strips (left side on Z face, right side on X face) to give 3D depth
    p_c_b = project(0, 0, 0)
    p_c_t = project(0, H, 0)
    
    # Left strip (extends along Z to Z = 15)
    p_c_l_b = project(0, 0, 15)
    p_c_l_t = project(0, H, 15)
    # Right strip (extends along X to X = 15)
    p_c_r_b = project(15, 0, 0)
    p_c_r_t = project(15, H, 0)
    
    svg_lines.append(f'  <!-- Center Column -->')
    svg_lines.append(f'  <polygon points="{p_c_b[0]:.1f},{p_c_b[1]:.1f} {p_c_l_b[0]:.1f},{p_c_l_b[1]:.1f} {p_c_l_t[0]:.1f},{p_c_l_t[1]:.1f} {p_c_t[0]:.1f},{p_c_t[1]:.1f}" fill="#2e2e31" stroke="#1c1c1e" stroke-width="0.5" />')
    svg_lines.append(f'  <polygon points="{p_c_b[0]:.1f},{p_c_b[1]:.1f} {p_c_r_b[0]:.1f},{p_c_r_b[1]:.1f} {p_c_r_t[0]:.1f},{p_c_r_t[1]:.1f} {p_c_t[0]:.1f},{p_c_t[1]:.1f}" fill="#1d1d1f" stroke="#111112" stroke-width="0.5" />')
    
    # Draw horizontal ribs on the center column strips
    for y_rib in range(15, H, 15):
        # Left side ribs
        prl1 = project(0, y_rib, 0)
        prl2 = project(0, y_rib, 15)
        svg_lines.append(f'  <line x1="{prl1[0]:.1f}" y1="{prl1[1]:.1f}" x2="{prl2[0]:.1f}" y2="{prl2[1]:.1f}" stroke="#131314" stroke-width="3" />')
        svg_lines.append(f'  <line x1="{prl1[0]:.1f}" y1="{prl1[1]+1:.1f}" x2="{prl2[0]:.1f}" y2="{prl2[1]+1:.1f}" stroke="#48484d" stroke-width="1" opacity="0.6" />')
        
        # Right side ribs
        prr1 = project(0, y_rib, 0)
        prr2 = project(15, y_rib, 0)
        svg_lines.append(f'  <line x1="{prr1[0]:.1f}" y1="{prr1[1]:.1f}" x2="{prr2[0]:.1f}" y2="{prr2[1]:.1f}" stroke="#0b0b0c" stroke-width="3" />')
        svg_lines.append(f'  <line x1="{prr1[0]:.1f}" y1="{prr1[1]+1:.1f}" x2="{prr2[0]:.1f}" y2="{prr2[1]+1:.1f}" stroke="#2f2f32" stroke-width="1" opacity="0.4" />')

    # 6.2 Left Corner Column (at Z=L)
    # Left strip (extends along Z to Z = L-15)
    # Right strip (extends along X to X = 15 at Z=L)
    p_l_b = project(0, 0, L)
    p_l_t = project(0, H, L)
    
    p_l_l_b = project(0, 0, L - 15)
    p_l_l_t = project(0, H, L - 15)
    
    # Since this corner wraps, we can show a sliver of the thickness
    p_l_thick_b = project(8, 0, L)
    p_l_thick_t = project(8, H, L)
    
    svg_lines.append(f'  <!-- Left Column -->')
    svg_lines.append(f'  <polygon points="{p_l_b[0]:.1f},{p_l_b[1]:.1f} {p_l_l_b[0]:.1f},{p_l_l_b[1]:.1f} {p_l_l_t[0]:.1f},{p_l_l_t[1]:.1f} {p_l_t[0]:.1f},{p_l_t[1]:.1f}" fill="#272729" stroke="#18181a" stroke-width="0.5" />')
    svg_lines.append(f'  <polygon points="{p_l_b[0]:.1f},{p_l_b[1]:.1f} {p_l_thick_b[0]:.1f},{p_l_thick_b[1]:.1f} {p_l_thick_t[0]:.1f},{p_l_thick_t[1]:.1f} {p_l_t[0]:.1f},{p_l_t[1]:.1f}" fill="#161618" stroke="#0d0d0e" stroke-width="0.5" />')
    
    for y_rib in range(15, H, 15):
        prl1 = project(0, y_rib, L)
        prl2 = project(0, y_rib, L - 15)
        svg_lines.append(f'  <line x1="{prl1[0]:.1f}" y1="{prl1[1]:.1f}" x2="{prl2[0]:.1f}" y2="{prl2[1]:.1f}" stroke="#131314" stroke-width="3" />')
        svg_lines.append(f'  <line x1="{prl1[0]:.1f}" y1="{prl1[1]+1:.1f}" x2="{prl2[0]:.1f}" y2="{prl2[1]+1:.1f}" stroke="#3d3d42" stroke-width="1" opacity="0.5" />')

    # 6.3 Right Corner Column (at X=W)
    p_r_c_b = project(W, 0, 0)
    p_r_c_t = project(W, H, 0)
    
    p_r_c_l_b = project(W - 15, 0, 0)
    p_r_c_l_t = project(W - 15, H, 0)
    
    # Thickness sliver
    p_r_thick_b = project(W, 0, 8)
    p_r_thick_t = project(W, H, 8)
    
    svg_lines.append(f'  <!-- Right Column -->')
    svg_lines.append(f'  <polygon points="{p_r_c_b[0]:.1f},{p_r_c_b[1]:.1f} {p_r_c_l_b[0]:.1f},{p_r_c_l_b[1]:.1f} {p_r_c_l_t[0]:.1f},{p_r_c_l_t[1]:.1f} {p_r_c_t[0]:.1f},{p_r_c_t[1]:.1f}" fill="#141415" stroke="#080809" stroke-width="0.5" />')
    svg_lines.append(f'  <polygon points="{p_r_c_b[0]:.1f},{p_r_c_b[1]:.1f} {p_r_thick_b[0]:.1f},{p_r_thick_b[1]:.1f} {p_r_thick_t[0]:.1f},{p_r_thick_t[1]:.1f} {p_r_c_t[0]:.1f},{p_r_c_t[1]:.1f}" fill="#1a1a1c" stroke="#0f0f10" stroke-width="0.5" />')
    
    for y_rib in range(15, H, 15):
        prr1 = project(W, y_rib, 0)
        prr2 = project(W - 15, y_rib, 0)
        svg_lines.append(f'  <line x1="{prr1[0]:.1f}" y1="{prr1[1]:.1f}" x2="{prr2[0]:.1f}" y2="{prr2[1]:.1f}" stroke="#09090a" stroke-width="3" />')
        svg_lines.append(f'  <line x1="{prr1[0]:.1f}" y1="{prr1[1]+1:.1f}" x2="{prr2[0]:.1f}" y2="{prr2[1]+1:.1f}" stroke="#2c2c2f" stroke-width="1" opacity="0.4" />')

    # 7. Shipping barcode sticker on the bottom left (plane Z=L)
    svg_lines.append(f'  <!-- Warped Shipping Label Sticker -->')
    # Define sticker coordinates in 3D: on plane X=0, Z=L
    # Stretched along Z from Z = 230 to Z = 70, height Y from Y = 18 to Y = 50
    st_b_l = project(0, 18, 220)
    st_b_r = project(0, 18, 80)
    st_t_r = project(0, 48, 80)
    st_t_l = project(0, 48, 220)
    
    svg_lines.append(f'  <polygon points="{st_b_l[0]:.1f},{st_b_l[1]:.1f} {st_b_r[0]:.1f},{st_b_r[1]:.1f} {st_t_r[0]:.1f},{st_t_r[1]:.1f} {st_t_l[0]:.1f},{st_t_l[1]:.1f}" fill="#f2efe4" stroke="#d5d0be" stroke-width="1.0" />')
    
    # Draw barcode bars inside the sticker
    # We interpolate between Z=205 and Z=95 (leaving margin)
    random.seed(99)
    z_bar = 205
    while z_bar > 95:
        width_z = random.choice([2.5, 4.5, 6.5])
        # Bar top and bottom
        b_bot = project(0, 23, z_bar)
        b_top = project(0, 43, z_bar)
        
        # Next coordinates for bar thickness
        b_bot_t = project(0, 23, z_bar - width_z)
        b_top_t = project(0, 43, z_bar - width_z)
        
        svg_lines.append(f'  <polygon points="{b_bot[0]:.1f},{b_bot[1]:.1f} {b_bot_t[0]:.1f},{b_bot_t[1]:.1f} {b_top_t[0]:.1f},{b_top_t[1]:.1f} {b_top[0]:.1f},{b_top[1]:.1f}" fill="#202022" />')
        z_bar -= width_z + random.choice([3, 5])
        
    # Draw simple text lines on the label
    # E.g. monospaced details
    pt1_s = project(0, 44, 215)
    pt1_e = project(0, 44, 170)
    svg_lines.append(f'  <line x1="{pt1_s[0]:.1f}" y1="{pt1_s[1]:.1f}" x2="{pt1_e[0]:.1f}" y2="{pt1_e[1]:.1f}" stroke="#505055" stroke-width="1.5" />')
    
    pt2_s = project(0, 44, 160)
    pt2_e = project(0, 44, 110)
    svg_lines.append(f'  <line x1="{pt2_s[0]:.1f}" y1="{pt2_s[1]:.1f}" x2="{pt2_e[0]:.1f}" y2="{pt2_e[1]:.1f}" stroke="#505055" stroke-width="1.5" />')
    
    pt3_s = project(0, 21, 210)
    pt3_e = project(0, 21, 140)
    svg_lines.append(f'  <line x1="{pt3_s[0]:.1f}" y1="{pt3_s[1]:.1f}" x2="{pt3_e[0]:.1f}" y2="{pt3_e[1]:.1f}" stroke="#65656b" stroke-width="1.0" />')

    # Top Rim Highlight Border
    # Draw a neat highlight line on the very top edge of the crate to pop it out
    svg_lines.append(f'  <!-- Rim Highlights -->')
    pr1 = project(0, H, L)
    pr2 = project(0, H, 0)
    pr3 = project(W, H, 0)
    svg_lines.append(f'  <line x1="{pr1[0]:.1f}" y1="{pr1[1]:.1f}" x2="{pr2[0]:.1f}" y2="{pr2[1]:.1f}" stroke="#56565c" stroke-width="2.5" opacity="0.8" />')
    svg_lines.append(f'  <line x1="{pr2[0]:.1f}" y1="{pr2[1]:.1f}" x2="{pr3[0]:.1f}" y2="{pr3[1]:.1f}" stroke="#3d3d42" stroke-width="2.0" opacity="0.6" />')

    svg_lines.append('</svg>')
    
    # Save the output
    svg_content = "\n".join(svg_lines)
    svg_path = "lab/milk-crate.svg"
    with open(svg_path, "w") as f:
        f.write(svg_content)
    print(f"Successfully generated 3/4 perspective SVG: {svg_path}")

if __name__ == "__main__":
    generate_svg()
