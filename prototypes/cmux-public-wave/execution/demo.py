"""Print two plans and synthetic observations. Never invokes CMUX."""
import json

from execution_request import ExecutionRequest, ResolvedTarget, plan, observed_receipt


def demonstration():
    request = ExecutionRequest("work:review-cmux", "source:cmux-main", "CMUX review")
    projection = "11111111-1111-4111-8111-111111111111"
    targets = (
        ResolvedTarget("local", "local", request.source_ref, "/Users/fixture/Projects/cmux", projection),
        ResolvedTarget("cloud", "fixture-machine", request.source_ref, "/home/fixture/cmux", projection, "ws_fixture"),
    )
    examples = []
    for target in targets:
        compiled = plan(request, target)
        # Deliberately synthetic opaque strings; not a live CMUX result or new ID syntax.
        result = {
            "resource": f"synthetic-{target.kind}-owner-resource",
            "terminal_id": f"synthetic-{target.kind}-terminal",
            "machine": target.machine,
            "remote_workspace_id": target.remote_workspace_id,
            "workspace_id": projection,
            "surface_id": "22222222-2222-4222-8222-222222222222",
        }
        examples.append({
            "plan": compiled,
            "synthetic_result": result,
            "observation": observed_receipt(compiled, result, evidence_ref=f"fixture:{target.kind}-result"),
        })
    return {"fixture_only": True, "executed": False, "examples": examples}


if __name__ == "__main__":
    print(json.dumps(demonstration(), indent=2))
