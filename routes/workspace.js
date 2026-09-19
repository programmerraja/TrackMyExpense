const express = require("express");
const WorkspaceController = require("../controllers/workspace");

const router = express.Router();

router
  .route("/")
  .get(WorkspaceController.listWorkspaces)
  .post(WorkspaceController.createWorkspace);

module.exports = router;
