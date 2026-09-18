import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

// usage: crop <in.png> <out.png> <x> <y> <w> <h>   (pixels, origin top-left)
let a = CommandLine.arguments
guard a.count == 7,
      let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: a[1]) as CFURL, nil),
      let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
    FileHandle.standardError.write("bad input\n".data(using: .utf8)!); exit(1)
}
let x = Int(a[3])!, y = Int(a[4])!
let w = min(Int(a[5])!, img.width - x), h = min(Int(a[6])!, img.height - y)
guard let out = img.cropping(to: CGRect(x: x, y: y, width: w, height: h)) else { exit(1) }
let url = URL(fileURLWithPath: a[2]) as CFURL
guard let dest = CGImageDestinationCreateWithURL(url, UTType.png.identifier as CFString, 1, nil) else { exit(1) }
CGImageDestinationAddImage(dest, out, nil)
CGImageDestinationFinalize(dest)
print("\(a[2]) \(w)x\(h)")
