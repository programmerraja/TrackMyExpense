const assert = require("assert");
const { workspaceCondition } = require("../controllers/workspace");

function matches(condition, row) {
  if (condition.workspaceId) {
    return row.workspaceId === condition.workspaceId;
  }

  return condition.$or.some((clause) => {
    if (clause.workspaceId === null) return row.workspaceId == null;
    return row.workspaceId === clause.workspaceId;
  });
}

const personal = workspaceCondition({
  _id: "personal-id",
  isDefault: true,
});
const business = workspaceCondition({
  _id: "business-id",
  isDefault: false,
});

assert(matches(personal, {}), "legacy rows must remain visible in Personal");
assert(matches(personal, { workspaceId: null }), "null rows belong to Personal");
assert(
  matches(personal, { workspaceId: "personal-id" }),
  "new Personal rows must be visible",
);
assert(
  !matches(personal, { workspaceId: "business-id" }),
  "other workspace rows must not leak into Personal",
);
assert(
  matches(business, { workspaceId: "business-id" }),
  "workspace rows must be visible in their workspace",
);
assert(
  !matches(business, {}),
  "legacy Personal rows must not leak into another workspace",
);

console.log("Workspace scope check passed");
