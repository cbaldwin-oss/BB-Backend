/**
 * Settings Module
 * Handles Admin-only system configurations and maintenance tasks.
 */
const Settings = {
    containerId: 'settings-container',
    currentCategory: 'Times', // Default category

    init() {
        const container = document.getElementById(this.containerId);
        this.render(container);
    },

    render(container) {
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.05); grid-column: span 2;">
                    <h3 style="margin-top:0; font-size:16px; color:#333;">📋 Dropdown Management</h3>
                    <p style="font-size: 13px; color: #666;">Add or remove options for your schedule's dropdown menus.</p>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 5px;">Select Category:</label>
                        <select id="setting-category-select" onchange="Settings.switchCategory(this.value)" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="Times">Times (Col 1)</option>
                            <option value="Places">Places (Col 2)</option>
                            <option value="Activities">Activities (Col 3)</option>
                            <option value="Assets">Assets (Col 4)</option>
                            <option value="Trade_Partners">Trade Partners (Col 6)</option>
                            <option value="Results">Results (Col 7)</option>
                        </select>
                    </div>

                    <div id="dropdown-list-container" style="max-height: 250px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px; padding: 10px; background: #fafafa;">
                        </div>

                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <input type="text" id="new-option-input" placeholder="Enter new option..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <button onclick="Settings.addOption()" style="background: #2e7d32; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">Add</button>
                    </div>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h3 style="margin-top:0; font-size:16px; color:#333;">📦 Database Maintenance</h3>
                    <p style="font-size: 13px; color: #666;">Wipe and re-verify Column 5 (Status) for the next 7 days.</p>
                    <button onclick="triggerFullStatusRefresh()" style="background: #01579b; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">🔄 Run 7-Day Status Refresh</button>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h3 style="margin-top:0; font-size:16px; color:#333;">👥 User Permissions</h3>
                    <p style="font-size: 13px; color: #666;">Add or remove users and toggle Admin privileges.</p>
                    <button onclick="toggleAdminPanel()" style="background: #2e7d32; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">👤 Manage User Access</button>
                </div>
            </div>
        `;
        this.loadCategoryData();
    },

    switchCategory(val) {
        this.currentCategory = val;
        this.loadCategoryData();
    },

    loadCategoryData() {
        const container = document.getElementById('dropdown-list-container');
        // Map UI category to the window.dropdownData key
        const mapping = { 'Times': 'col1', 'Places': 'col2', 'Activities': 'col3', 'Assets': 'col4', 'Trade_Partners': 'col6', 'Results': 'col7' };
        const dataKey = mapping[this.currentCategory];
        const options = window.dropdownData[dataKey] || [];

        if (options.length === 0) {
            container.innerHTML = '<p style="color:#999; font-size:12px; text-align:center;">No options found for this category.</p>';
            return;
        }

        container.innerHTML = options.map(opt => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid #eee;">
                <span style="font-size:13px;">${opt}</span>
                <button onclick="Settings.deleteOption('${opt}')" style="background:none; border:none; color:#d32f2f; cursor:pointer; font-size:16px;">&times;</button>
            </div>
        `).join('');
    },

    async addOption() {
        const input = document.getElementById('new-option-input');
        const val = input.value.trim();
        if (!val) return;

        // Add to Supabase (inserts a new row with just this column filled)
        const insertData = {};
        insertData[this.currentCategory] = val;

        const { error } = await _supabase.from('dropdownoptions').insert([insertData]);

        if (error) {
            alert("Error adding option: " + error.message);
        } else {
            input.value = "";
            await this.refreshAppData();
        }
    },

    async deleteOption(val) {
        if (!confirm(`Are you sure you want to delete "${val}" from ${this.currentCategory}?`)) return;

        // Delete from Supabase (sets specific column cells to null where value matches)
        const updateData = {};
        updateData[this.currentCategory] = null;

        const { error } = await _supabase
            .from('dropdownoptions')
            .update(updateData)
            .eq(this.currentCategory, val);

        if (error) {
            alert("Error deleting option: " + error.message);
        } else {
            await this.refreshAppData();
        }
    },

    async refreshAppData() {
        // 1. Fetch fresh data from Supabase to window.dropdownData
        await fetchDropdownOptions();
        // 2. Refresh the schedule's dropdown menus
        refreshDropdowns();
        // 3. Update the settings UI list
        this.loadCategoryData();
    }
};