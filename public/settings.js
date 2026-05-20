/**
 * Settings Module
 * Handles Admin-only system configurations and maintenance tasks.
 */
const Settings = {
    containerId: 'settings-container',

    init() {
        const container = document.getElementById(this.containerId);
        this.render(container);
    },

    render(container) {
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h3 style="margin-top:0; font-size:16px; color:#333;">📦 Database Maintenance</h3>
                    <p style="font-size: 13px; color: #666;">Wipe and re-verify Column 5 (Status) for the next 7 days from the Master Asset Sheet.</p>
                    <button onclick="triggerFullStatusRefresh()" 
                            style="background: #01579b; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">
                        🔄 Run 7-Day Status Refresh
                    </button>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h3 style="margin-top:0; font-size:16px; color:#333;">👥 User Permissions</h3>
                    <p style="font-size: 13px; color: #666;">Add or remove users and toggle Admin privileges for the LaunchPad.</p>
                    <button onclick="toggleAdminPanel()" 
                            style="background: #2e7d32; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">
                        👤 Manage User Access
                    </button>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h3 style="margin-top:0; font-size:16px; color:#333;">ℹ️ System Information</h3>
                    <div style="font-size: 13px; color: #666;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>Current User:</span>
                            <span style="font-weight:bold;">${localStorage.getItem('launchpad_email')}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span>Environment:</span>
                            <span style="color: green; font-weight:bold;">Production</span>
                        </div>
                    </div>
                </div>

            </div>
        `;
    }
};