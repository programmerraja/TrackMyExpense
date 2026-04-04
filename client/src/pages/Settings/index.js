import React, { useState, useCallback } from "react";
import { useToast } from "../../components/Toast";
import API from "../../utils/API";
import "./style.css";

const Settings = () => {
  const { addToast } = useToast();
  const [budgetSettings, setBudgetSettings] = useState({
    baseSalaryLimit: Number(localStorage.getItem("baseSalaryLimit")) || 0,
    autoAllocationVault:
      localStorage.getItem("autoAllocationVault") || "emergency",
  });

  const handleSaveSettings = useCallback(() => {
    API.updateSettings(budgetSettings)
      .then(() => {
        addToast("Budget settings saved!", "success");
        localStorage.setItem("baseSalaryLimit", budgetSettings.baseSalaryLimit);
        localStorage.setItem(
          "autoAllocationVault",
          budgetSettings.autoAllocationVault,
        );
      })
      .catch((err) => {
        addToast("Failed to save settings: " + err.message, "error");
      });
  }, [budgetSettings, addToast]);

  return (
    <div className="settingsPage">
      <div className="settingsHeader">
        <h2>Settings</h2>
        <p>Manage your account preferences and budget rules.</p>
      </div>

      <div className="settingsSection">
        <h3>Budget & Vault Rules</h3>
        <div className="settingsGrid">
          <div className="settingItem">
            <div className="settingLabelRow">
              <label>Monthly Salary Limit</label>
              <div className="infoPopover">
                <span className="infoIcon">i</span>
                <div className="popoverContent">
                  Any income entry named "Salary" exceeding this limit will be
                  automatically split. For example, if your limit is 75k and you
                  earn 90k, the extra 15k is moved to your selected vault.
                </div>
              </div>
            </div>
            <input
              type="number"
              value={budgetSettings.baseSalaryLimit}
              onChange={(e) =>
                setBudgetSettings({
                  ...budgetSettings,
                  baseSalaryLimit: e.target.value,
                })
              }
              placeholder="e.g. 75000"
            />
          </div>

          <div className="settingItem">
            <div className="settingLabelRow">
              <label>Auto-Allocation Vault</label>
              <div className="infoPopover">
                <span className="infoIcon">i</span>
                <div className="popoverContent">
                  Choose which "Virtual Vault" should receive any income that
                  exceeds your salary limit. This keeps your emergency savings
                  separate from your daily spendable money.
                </div>
              </div>
            </div>
            <select
              value={budgetSettings.autoAllocationVault}
              onChange={(e) =>
                setBudgetSettings({
                  ...budgetSettings,
                  autoAllocationVault: e.target.value,
                })
              }
            >
              <option value="emergency">Emergency Fund</option>
              <option value="debt">Debt / Savings</option>
            </select>
          </div>
        </div>
        <button className="saveBtn" onClick={handleSaveSettings}>
          Save Budget Settings
        </button>
      </div>

      <div className="settingsSection">
        <h3>Privacy Mode Info</h3>
        <p className="privacySummary">
          You can toggle **Privacy Mode** directly from the Dashboard. When on,
          only your **Primary** vault data is shown, hiding your allocated
          savings from view.
        </p>
      </div>
    </div>
  );
};

export default Settings;
