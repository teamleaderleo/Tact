// Test driver only. The runner prepends unmodified pinned production declarations.
@main
struct IdentityCases {
    @MainActor
    static func main() throws {
        let data = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))
        let fixture = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        for row in fixture["resource_wire_cases"] as! [[String: Any]] {
            let parsed = SurfaceResourceID(rawValue: row["wire"] as! String)
            if let expected = row["canonical"] as? String {
                precondition(parsed?.rawValue == expected)
            } else {
                precondition(parsed == nil)
            }
        }
        for row in fixture["cursor_wire_cases"] as! [[String: Any]] {
            let parsed = CloudVMCursor(wire: row["wire"] as! [String: Any])
            if let expected = row["revision"] as? String {
                precondition(parsed?.revision == UInt64(expected))
            } else {
                precondition(parsed == nil)
            }
        }
        let old = CloudVMCursor(generation: "daemon-a", revision: 100)
        let new = CloudVMCursor(generation: "daemon-b", revision: 1)
        precondition(!new.isNewer(than: old)) // opaque generations have no order
        precondition(CloudVMGenerationAcceptanceDecision.resolve(
            incoming: old.generation, current: new.generation,
            accepted: [old.generation, new.generation]) == .rejectStale)
        precondition(CloudVMGenerationAcceptanceDecision.resolve(
            incoming: new.generation, current: old.generation,
            accepted: [old.generation]) == .accept)
        // A new authoritative lineage retires the receipt; this is NOT effect authorization.
        precondition(CloudVMRemoteMutationReceiptDecision.resolve(
            receipt: old, incoming: new, targetMatches: false) == .accept)
        precondition(CloudVMRemoteMutationReceiptDecision.resolve(
            receipt: old, incoming: .init(generation: old.generation, revision: 99),
            targetMatches: true) == .rejectStale)
        precondition(CloudVMRemoteMutationReceiptDecision.resolve(
            receipt: old, incoming: old, targetMatches: false) == .rejectConflict)
        precondition(CloudVMRemoteMutationAuthority.resolve(
            refreshEstablishedCurrentGraph: false, hasAcceptedState: true,
            targetVisible: true, hasVersionedCursor: true, hasPendingReceipt: true) == .unavailable)

        let stable = UUID(uuidString: "00000000-0000-4000-8000-000000000001")!
        let exclusions = SessionRestoreIdentityExclusions()
        exclusions.beginRestore(excluding: [stable])
        precondition(!exclusions.shouldAdopt(stable))
        exclusions.beginRestore(excluding: [])
        precondition(exclusions.shouldAdopt(stable))
        exclusions.endRestore()
        precondition(!exclusions.shouldAdopt(stable))
        exclusions.endRestore()
        precondition(exclusions.shouldAdopt(stable))

        let session = "00000000-0000-4000-8000-000000000099"
        let path = "/sanitized/session_\(session).jsonl"
        precondition(ManagedAgentSessionIdentity.sessionIDsMatch(kind: "pi", lhs: session, rhs: path))
        precondition(ManagedAgentSessionIdentity.canonicalSessionID(kind: "omp", sessionID: path) == session)
        precondition(!ManagedAgentSessionIdentity.sessionIDsMatch(kind: "codex", lhs: session, rhs: path))
        precondition(!ManagedAgentSessionIdentity.sessionIDsMatch(kind: "pi", lhs: session, rhs: "same label"))
        print("native identity cases passed")
    }
}
