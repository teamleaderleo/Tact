import CoreGraphics
import Foundation
let opts: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
guard let list = CGWindowListCopyWindowInfo(opts, kCGNullWindowID) as? [[String: Any]] else { exit(1) }
for w in list {
    let owner = w[kCGWindowOwnerName as String] as? String ?? ""
    guard owner.lowercased().contains("cmux") || owner.lowercased().contains("ghostty") else { continue }
    let num = w[kCGWindowNumber as String] as? Int ?? -1
    let name = w[kCGWindowName as String] as? String ?? ""
    let layer = w[kCGWindowLayer as String] as? Int ?? -1
    let b = w[kCGWindowBounds as String] as? [String: Any] ?? [:]
    let ww = (b["Width"] as? Double) ?? 0, hh = (b["Height"] as? Double) ?? 0
    print("\(num) | \(owner) | \(name) | \(Int(ww))x\(Int(hh)) | layer \(layer)")
}
