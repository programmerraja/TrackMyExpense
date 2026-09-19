const mongoose = require("mongoose");
const User = require("../models/user");

async function ensurePersonalWorkspace(user) {
  if (user.workspaces && user.workspaces.length) {
    return user;
  }

  const updated = await User.findOneAndUpdate(
    {
      _id: user._id,
      $or: [
        { workspaces: { $exists: false } },
        { workspaces: { $size: 0 } },
      ],
    },
    {
      $push: {
        workspaces: {
          name: "Personal",
          isDefault: true,
          createdAt: new Date(),
        },
      },
    },
    { new: true },
  );

  return updated || User.findById(user._id);
}

async function resolveWorkspace(user, requestedId) {
  const currentUser = await ensurePersonalWorkspace(user);
  const workspaces = currentUser.workspaces || [];
  const fallback =
    workspaces.find((item) => item.isDefault) || workspaces[0];
  const workspace = requestedId
    ? workspaces.find((item) => String(item._id) === String(requestedId))
    : fallback;

  if (!workspace) {
    const error = new Error("Workspace not found");
    error.status = 404;
    throw error;
  }

  return { user: currentUser, workspace };
}

function workspaceCondition(workspace) {
  // Mongo `{ field: null }` already matches missing fields.
  if (workspace.isDefault) {
    return {
      $or: [
        { workspaceId: String(workspace._id) },
        { workspaceId: null },
      ],
    };
  }

  return { workspaceId: String(workspace._id) };
}

exports.listWorkspaces = async (req, res) => {
  try {
    const user = await ensurePersonalWorkspace(req.user);
    return res.status(200).json({ success: true, data: user.workspaces });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.createWorkspace = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Workspace name is required",
      });
    }
    if (name.length > 40) {
      return res.status(400).json({
        success: false,
        error: "Workspace name must be 40 characters or less",
      });
    }

    const user = await ensurePersonalWorkspace(req.user);
    if (
      user.workspaces.some(
        (workspace) => workspace.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      return res.status(409).json({
        success: false,
        error: "A workspace with this name already exists",
      });
    }

    const workspace = {
      _id: new mongoose.Types.ObjectId(),
      name,
      isDefault: false,
      createdAt: new Date(),
    };
    await User.updateOne(
      { _id: user._id },
      { $push: { workspaces: workspace } },
    );

    return res.status(201).json({ success: true, data: workspace });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.ensurePersonalWorkspace = ensurePersonalWorkspace;
exports.resolveWorkspace = resolveWorkspace;
exports.workspaceCondition = workspaceCondition;
