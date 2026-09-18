import ApplicationServices
import Foundation

guard CommandLine.arguments.count > 2, let pid = Int32(CommandLine.arguments[1]) else { exit(2) }
let needle = CommandLine.arguments[2]
let occurrence = CommandLine.arguments.count > 3 ? Int(CommandLine.arguments[3]) ?? 0 : 0
let app = AXUIElementCreateApplication(pid)

func attr(_ e: AXUIElement, _ a: String) -> Any? {
    var v: CFTypeRef?
    return AXUIElementCopyAttributeValue(e, a as CFString, &v) == .success ? v : nil
}
var hits: [AXUIElement] = []
func walk(_ e: AXUIElement, _ depth: Int) {
    if depth > 16 || hits.count > 40 { return }
    let role = attr(e, kAXRoleAttribute as String) as? String ?? ""
    let desc = attr(e, kAXDescriptionAttribute as String) as? String ?? ""
    let ident = attr(e, "AXIdentifier") as? String ?? ""
    let title = attr(e, kAXTitleAttribute as String) as? String ?? ""
    if role == "AXButton" || role == "AXMenuItem" || role == "AXRadioButton" || role == "AXCheckBox" {
        if desc == needle || ident == needle || title == needle { hits.append(e) }
    }
    for c in (attr(e, kAXChildrenAttribute as String) as? [AXUIElement]) ?? [] { walk(c, depth + 1) }
}
walk(app, 0)
guard occurrence < hits.count else {
    FileHandle.standardError.write("no match '\(needle)' (found \(hits.count))\n".data(using: .utf8)!)
    exit(1)
}
let action = ProcessInfo.processInfo.environment["AXACTION"] ?? (kAXPressAction as String)
let r = AXUIElementPerformAction(hits[occurrence], action as CFString)
print("pressed '\(needle)'[\(occurrence)] of \(hits.count) -> \(r == .success ? "ok" : "err \(r.rawValue)")")
