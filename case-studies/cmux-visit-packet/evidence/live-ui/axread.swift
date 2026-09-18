import ApplicationServices
import Foundation

let trusted = AXIsProcessTrusted()
FileHandle.standardError.write("AXIsProcessTrusted=\(trusted)\n".data(using: .utf8)!)
guard CommandLine.arguments.count > 1, let pid = Int32(CommandLine.arguments[1]) else { exit(2) }
let app = AXUIElementCreateApplication(pid)

func attr(_ e: AXUIElement, _ a: String) -> Any? {
    var v: CFTypeRef?
    return AXUIElementCopyAttributeValue(e, a as CFString, &v) == .success ? v : nil
}
func walk(_ e: AXUIElement, _ depth: Int, _ found: inout Int) {
    if depth > 14 || found > 400 { return }
    let role = attr(e, kAXRoleAttribute as String) as? String ?? ""
    if role == "AXButton" {
        let title = attr(e, kAXTitleAttribute as String) as? String ?? ""
        let desc  = attr(e, kAXDescriptionAttribute as String) as? String ?? ""
        let ident = attr(e, "AXIdentifier") as? String ?? ""
        var w = 0.0, h = 0.0
        if let sz = attr(e, kAXSizeAttribute as String) {
            var cg = CGSize.zero
            AXValueGetValue(sz as! AXValue, .cgSize, &cg); w = cg.width; h = cg.height
        }
        let actions = { () -> String in
            var names: CFArray?
            AXUIElementCopyActionNames(e, &names)
            return ((names as? [String]) ?? []).joined(separator: ",")
        }()
        print("AXButton title=\(title.isEmpty ? "-" : "\"\(title)\"") desc=\(desc.isEmpty ? "-" : "\"\(desc)\"") id=\(ident.isEmpty ? "-" : ident) size=\(Int(w))x\(Int(h)) actions=[\(actions)]")
        found += 1
    }
    for c in (attr(e, kAXChildrenAttribute as String) as? [AXUIElement]) ?? [] { walk(c, depth+1, &found) }
}
var n = 0
walk(app, 0, &n)
FileHandle.standardError.write("buttons=\(n)\n".data(using: .utf8)!)
